import html2pdf from 'html2pdf.js';
import type { AppConfig, Client, Contract, TransportRequest } from '../types';
import { formatCurrency, formatDate } from './utils';

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const BRAND = '#6D4AFF';

function shell(config: AppConfig, docTitle: string, docNumber: string, body: string) {
  const contact = [config.companyCnpj && `CNPJ ${esc(config.companyCnpj)}`, esc(config.companyPhone), esc(config.companyEmail)]
    .filter(Boolean)
    .join(' &middot; ');
  return `
  <div style="font-family: Helvetica, Arial, sans-serif; color:#16181d; font-size:11px; line-height:1.55; padding:28px 34px; width:740px; background:#fff;">
    <table style="width:100%; border-collapse:collapse; border-bottom:3px solid ${BRAND}; padding-bottom:14px;">
      <tr>
        <td style="vertical-align:middle;">
          <div style="font-size:20px; font-weight:800; letter-spacing:-0.3px;">${esc(config.companyName)}</div>
          <div style="color:#5b6170; font-size:10px; margin-top:2px;">${contact}</div>
        </td>
        <td style="text-align:right; vertical-align:middle;">
          <div style="font-size:10px; font-weight:700; letter-spacing:1.5px; color:${BRAND}; text-transform:uppercase;">${esc(docTitle)}</div>
          <div style="font-size:15px; font-weight:800; margin-top:2px;">${esc(docNumber)}</div>
          <div style="color:#5b6170; font-size:10px;">Emitido em ${new Date().toLocaleDateString('pt-BR')}</div>
        </td>
      </tr>
    </table>
    ${body}
    <div style="margin-top:28px; padding-top:10px; border-top:1px solid #e3e5ea; color:#8a909c; font-size:9px; text-align:center;">
      Documento gerado pelo Cargova
    </div>
  </div>`;
}

function section(title: string, inner: string) {
  return `
    <div style="margin-top:20px;">
      <div style="font-size:9px; font-weight:800; letter-spacing:1.5px; text-transform:uppercase; color:${BRAND}; margin-bottom:6px;">${esc(title)}</div>
      ${inner}
    </div>`;
}

function kv(rows: [string, string][]) {
  return `<table style="width:100%; border-collapse:collapse;">${rows
    .map(
      ([k, v]) => `<tr>
        <td style="padding:5px 0; color:#5b6170; width:38%; border-bottom:1px solid #f0f1f4;">${esc(k)}</td>
        <td style="padding:5px 0; font-weight:600; border-bottom:1px solid #f0f1f4;">${v}</td>
      </tr>`,
    )
    .join('')}</table>`;
}

async function save(html: string, filename: string) {
  const el = document.createElement('div');
  el.innerHTML = html;
  el.style.position = 'fixed';
  el.style.left = '-10000px';
  el.style.top = '0';
  document.body.appendChild(el);
  try {
    await html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename,
        image: { type: 'jpeg', quality: 0.96 },
        html2canvas: { scale: 2, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      })
      .from(el.firstElementChild as HTMLElement)
      .save();
  } finally {
    el.remove();
  }
}

/** Orçamento de transporte em PDF, pronto para mandar ao cliente */
export async function downloadQuotePdf(req: TransportRequest, client: Client | undefined, config: AppConfig) {
  const number = `ORÇ-${req.id.slice(0, 6).toUpperCase()}`;
  const clientRows: [string, string][] = [
    ['Cliente', esc(req.clientName)],
    ...(client?.cpfCnpj ? [['CPF/CNPJ', esc(client.cpfCnpj)] as [string, string]] : []),
    ...(client?.phone || client?.whatsapp ? [['Telefone', esc(client.whatsapp || client.phone)] as [string, string]] : []),
    ...(client?.email ? [['E-mail', esc(client.email)] as [string, string]] : []),
  ];
  const body =
    section('Cliente', kv(clientRows)) +
    section(
      'Serviço',
      kv([
        ['Veículo', esc(req.vehicleName)],
        ['Origem', esc(req.origin)],
        ['Destino', esc(req.destination)],
        ['Distância', `${esc(req.distanceKm)} km`],
        ['Coleta prevista', esc(formatDate(req.collectDate))],
        ['Entrega prevista', esc(formatDate(req.estimatedDeliveryDate))],
      ]),
    ) +
    section(
      'Valores',
      `<table style="width:100%; border-collapse:collapse;">
        <tr><td style="padding:6px 0; color:#5b6170;">Frete</td><td style="text-align:right;">${formatCurrency(req.baseValue || 0)}</td></tr>
        <tr><td style="padding:6px 0; color:#5b6170;">Seguro</td><td style="text-align:right;">${formatCurrency(req.insuranceCost || 0)}</td></tr>
        <tr><td style="padding:6px 0; color:#5b6170;">Pedágios</td><td style="text-align:right;">${formatCurrency(req.tollCost || 0)}</td></tr>
        <tr>
          <td style="padding:10px 12px; background:${BRAND}; color:#fff; font-weight:800; font-size:13px;">TOTAL</td>
          <td style="padding:10px 12px; background:${BRAND}; color:#fff; font-weight:800; font-size:13px; text-align:right;">${formatCurrency(req.totalValue || 0)}</td>
        </tr>
      </table>`,
    ) +
    (req.observations ? section('Observações', `<div style="white-space:pre-wrap;">${esc(req.observations)}</div>`) : '') +
    section(
      'Condições',
      `<div style="color:#5b6170;">Orçamento válido por 7 dias. Valores sujeitos a confirmação de disponibilidade de data e motorista.</div>`,
    );
  await save(shell(config, 'Orçamento de transporte', number, body), `orcamento-${number}.pdf`);
}

/** Contrato em PDF, com cláusulas e campos de assinatura */
export async function downloadContractPdf(contract: Contract, client: Client | undefined, config: AppConfig) {
  const clientDesc = [
    esc(contract.clientName),
    client?.cpfCnpj && `CPF/CNPJ ${esc(client.cpfCnpj)}`,
    client?.address && `${esc(client.address)}, ${esc(client.number)} — ${esc(client.city)}/${esc(client.state)}`,
  ]
    .filter(Boolean)
    .join(', ');
  const body =
    `<div style="text-align:center; margin-top:20px; font-size:14px; font-weight:800; text-transform:uppercase;">${esc(contract.title)}</div>` +
    section(
      'Partes',
      `<p style="margin:0 0 6px;"><b>CONTRATADA:</b> ${esc(config.companyName)}${config.companyCnpj ? `, CNPJ ${esc(config.companyCnpj)}` : ''}.</p>
       <p style="margin:0;"><b>CONTRATANTE:</b> ${clientDesc}.</p>`,
    ) +
    section('Valor', `<p style="margin:0;">Valor total do contrato: <b>${formatCurrency(contract.value || 0)}</b>.</p>`) +
    section('Cláusulas', `<div style="white-space:pre-wrap; text-align:justify;">${esc(contract.clauses)}</div>`) +
    `<table style="width:100%; margin-top:60px; border-collapse:collapse; page-break-inside:avoid;">
      <tr>
        <td style="width:50%; padding:0 20px; text-align:center;">
          <div style="border-top:1px solid #16181d; padding-top:6px; font-weight:700;">${esc(config.companyName)}</div>
          <div style="color:#5b6170; font-size:9px;">Contratada</div>
        </td>
        <td style="width:50%; padding:0 20px; text-align:center;">
          <div style="border-top:1px solid #16181d; padding-top:6px; font-weight:700;">${esc(contract.clientName)}</div>
          <div style="color:#5b6170; font-size:9px;">Contratante</div>
        </td>
      </tr>
    </table>`;
  await save(shell(config, 'Contrato', contract.contractNumber, body), `contrato-${contract.contractNumber}.pdf`);
}

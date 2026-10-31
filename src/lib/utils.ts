/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (date: string) => {
  if (!date) return '-';
  // "AAAA-MM-DD" é interpretado como UTC pelo JS e mostraria o dia anterior no Brasil
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(date);
  return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('pt-BR');
};

export const generateId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

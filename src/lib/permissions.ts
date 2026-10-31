import type { ViewType } from '../components/Navigation';
import type { Role } from '../types';

/** Telas que cada papel pode abrir */
const ACCESS: Record<Role, ViewType[]> = {
  admin: [
    'dashboard', 'transport_requests', 'clients', 'vehicles_transported', 'fleet',
    'drivers', 'contracts', 'finance', 'reports', 'settings', 'admin',
  ],
  operador: [
    'dashboard', 'transport_requests', 'clients', 'vehicles_transported', 'fleet',
    'drivers', 'contracts',
  ],
  motorista: ['my_trips'],
};

export function canAccess(role: Role, view: ViewType): boolean {
  return ACCESS[role].includes(view);
}

export function homeView(role: Role): ViewType {
  return role === 'motorista' ? 'my_trips' : 'dashboard';
}

/** Só o admin pode excluir registros */
export function canDelete(role: Role): boolean {
  return role === 'admin';
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrador',
  operador: 'Operador',
  motorista: 'Motorista',
};

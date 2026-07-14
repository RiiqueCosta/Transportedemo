/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const db = {} as any;
export const auth = {
  currentUser: null,
} as any;

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  console.error('Firestore Error:', error, operationType, path);
  throw new Error(String(error));
}


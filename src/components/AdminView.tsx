/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { UserPlus, Shield, Trash2, Mail, Calendar, Key } from 'lucide-react';
import { formatCurrency, formatDate } from '../lib/utils';

interface AllowedUser {
  email: string;
  role: 'collaborator' | 'admin';
  addedAt: string;
  ownerUid: string;
}

interface AdminViewProps {
  ownerUid: string;
}

export function AdminView({ ownerUid }: AdminViewProps) {
  const [allowedUsers, setAllowedUsers] = useState<AllowedUser[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'collaborator' | 'admin'>('collaborator');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const colRef = collection(db, 'allowed_users');
    
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const users: AllowedUser[] = [];
      snapshot.forEach((snapshotDoc) => {
        users.push(snapshotDoc.data() as AllowedUser);
      });
      setAllowedUsers(users);
      setLoading(false);
    }, (error) => {
      // Catch and log firebase errors cleanly
      try {
        handleFirestoreError(error, OperationType.LIST, 'allowed_users');
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    const targetEmail = email.toLowerCase().trim();
    const docRef = doc(db, 'allowed_users', targetEmail);

    try {
      const payload: AllowedUser = {
        email: targetEmail,
        role,
        addedAt: new Date().toISOString(),
        ownerUid: ownerUid || auth.currentUser?.uid || ''
      };

      await setDoc(docRef, payload);
      setEmail('');
      setRole('collaborator');
    } catch (error) {
      alert('Erro ao convidar usuário. Verifique suas credenciais de administrador.');
      try {
        handleFirestoreError(error, OperationType.CREATE, `allowed_users/${targetEmail}`);
      } catch (err) {
        console.error(err);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (targetEmail: string) => {
    if (!confirm(`Tem certeza que deseja revogar o acesso de "${targetEmail}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'allowed_users', targetEmail));
    } catch (error) {
      alert('Erro ao remover usuário.');
      try {
        handleFirestoreError(error, OperationType.DELETE, `allowed_users/${targetEmail}`);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="px-2.5 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider font-mono">
              Painel do Administrador
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-zinc-50 mt-2 tracking-tight">
              Permissões e Colaboradores
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Gerencie quem pode acessar e colaborar nas solicitações de transporte, frotas e relatórios operacionais associados a sua conta.
            </p>
          </div>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">E-mail do Colaborador (Google Account)</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@gmail.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-2">Nível de Acesso (Cargo)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-2 focus:ring-brand focus:border-transparent outline-none transition-all dark:text-zinc-100"
            >
              <option value="collaborator">Colaborador (Read / Write)</option>
              <option value="admin">Administrador (Total)</option>
            </select>
          </div>
          <div className="md:col-span-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full md:w-auto px-6 py-3 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-brand/10 disabled:opacity-50 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              {submitting ? 'Convidando...' : 'Convidar e Autorizar'}
            </button>
          </div>
        </form>
      </div>

      {/* Collaborator List */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">Usuários Autorizados</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-zinc-500">Buscando colaboradores autorizados...</p>
          </div>
        ) : allowedUsers.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
            <Shield className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="font-bold text-zinc-800 dark:text-zinc-200">Nenhum colaborador adicionado</p>
            <p className="text-xs mt-1">Convide outros usuários do Gmail para compartilharem o painel de gestão.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                  <th className="p-4 px-6">Email Autorizado</th>
                  <th className="p-4 px-6">Cargo</th>
                  <th className="p-4 px-6">Adicionado Em</th>
                  <th className="p-4 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 text-sm text-zinc-700 dark:text-zinc-300">
                {allowedUsers.map((userSnap) => (
                  <tr key={userSnap.email} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all font-medium">
                    <td className="p-4 px-6 font-semibold text-zinc-900 dark:text-zinc-100">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-zinc-400" />
                        <span>{userSnap.email}</span>
                      </div>
                    </td>
                    <td className="p-4 px-6">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        userSnap.role === 'admin' 
                          ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' 
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                      }`}>
                        {userSnap.role}
                      </span>
                    </td>
                    <td className="p-4 px-6 text-xs text-zinc-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{formatDate(userSnap.addedAt)}</span>
                      </div>
                    </td>
                    <td className="p-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(userSnap.email)}
                        className="p-1 px-3 rounded-lg border border-red-200 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/25 flex items-center gap-1.5 ml-auto text-xs font-bold transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

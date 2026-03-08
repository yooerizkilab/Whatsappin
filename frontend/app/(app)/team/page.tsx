'use client';

import { useState, useEffect } from 'react';
import { agentAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

export default function TeamPage() {
    const { user } = useAuthStore();
    const [agents, setAgents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingAgent, setEditingAgent] = useState<any>(null);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        permissions: {
            canSendMessages: true,
            canManageContacts: true,
            canViewAnalytics: true,
        }
    });

    useEffect(() => {
        fetchAgents();
    }, []);

    const fetchAgents = async () => {
        try {
            const res = await agentAPI.list();
            setAgents(res.data.data);
        } catch (err: any) {
            toast.error('Failed to fetch team members');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingAgent) {
                await agentAPI.update(editingAgent.id, form);
                toast.success('Agent updated successfully');
            } else {
                await agentAPI.create(form);
                toast.success('Agent created successfully');
            }
            setShowModal(false);
            setEditingAgent(null);
            resetForm();
            fetchAgents();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            email: '',
            password: '',
            phone: '',
            permissions: {
                canSendMessages: true,
                canManageContacts: true,
                canViewAnalytics: true,
            }
        });
    };

    const handleEdit = (agent: any) => {
        setEditingAgent(agent);
        setForm({
            name: agent.name,
            email: agent.email,
            password: '',
            phone: agent.phone || '',
            permissions: agent.permissions || {
                canSendMessages: true,
                canManageContacts: true,
                canViewAnalytics: true,
            }
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this agent?')) return;
        try {
            await agentAPI.delete(id);
            toast.success('Agent deleted');
            fetchAgents();
        } catch (err) {
            toast.error('Failed to delete agent');
        }
    };

    if (user?.role === 'AGENT') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
                <p className="text-gray-400">Only primary users can manage team members.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Team Management</h1>
                    <p className="text-gray-400">Manage your CS sub-accounts and permissions</p>
                </div>
                <button 
                    onClick={() => { resetForm(); setEditingAgent(null); setShowModal(true); }}
                    className="btn-primary"
                >
                    + Add Member
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="text-gray-400">Loading team...</p>
                ) : agents.length === 0 ? (
                    <div className="col-span-full card p-12 text-center text-gray-500">
                        No team members found. Start by adding one!
                    </div>
                ) : agents.map((agent: any) => (
                    <div key={agent.id} className="card group hover:border-primary/50 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                                {agent.name[0].toUpperCase()}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => handleEdit(agent)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400">
                                    ✏️
                                </button>
                                <button onClick={() => handleDelete(agent.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-400">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-white">{agent.name}</h3>
                        <p className="text-sm text-gray-400 mb-4">{agent.email}</p>
                        
                        <div className="space-y-2 border-t border-white/5 pt-4">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Permissions</p>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(agent.permissions || {}).map(([key, val]) => val && (
                                    <span key={key} className="px-2 py-1 rounded bg-white/5 text-[10px] text-gray-300">
                                        {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in duration-300">
                        <h2 className="text-xl font-bold text-white mb-6">
                            {editingAgent ? 'Edit Team Member' : 'Add New Team Member'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="label">Full Name</label>
                                <input 
                                    className="input" 
                                    required 
                                    value={form.name}
                                    onChange={(e) => setForm({...form, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="label">Email Address</label>
                                <input 
                                    type="email" 
                                    className="input" 
                                    required 
                                    disabled={!!editingAgent}
                                    value={form.email}
                                    onChange={(e) => setForm({...form, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="label">Password {editingAgent && '(Leave blank to keep current)'}</label>
                                <input 
                                    type="password" 
                                    className="input" 
                                    required={!editingAgent}
                                    value={form.password}
                                    onChange={(e) => setForm({...form, password: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="label">Phone (WhatsApp)</label>
                                <input 
                                    className="input" 
                                    value={form.phone}
                                    onChange={(e) => setForm({...form, phone: e.target.value})}
                                />
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <p className="text-sm font-semibold text-white mb-3">Permissions</p>
                                <div className="space-y-3">
                                    {Object.keys(form.permissions).map((key) => (
                                        <label key={key} className="flex items-center gap-3 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={(form.permissions as any)[key]}
                                                onChange={(e) => setForm({
                                                    ...form, 
                                                    permissions: { ...form.permissions, [key]: e.target.checked }
                                                })}
                                                className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary"
                                            />
                                            <span className="text-sm text-gray-300">
                                                {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 rounded-xl bg-white/5 text-gray-300 hover:bg-white/10 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 btn-primary justify-center">
                                    {editingAgent ? 'Update' : 'Invite'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

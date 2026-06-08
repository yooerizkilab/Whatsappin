'use client';

import { useEffect, useState } from 'react';
import { blastAPI, deviceAPI, templateAPI, contactAPI } from '@/services/api';
import { useDeviceStore } from '@/store/deviceStore';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import MediaSelector from '@/components/MediaSelector';

interface BlastJob {
  id: string;
  name: string;
  status: string;
  _count: { recipients: number };
  device: { name: string };
  createdAt: string;
}

export default function BlastPage() {
  const { devices, setDevices } = useDeviceStore();
  const [templates, setTemplates] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [jobs, setJobs] = useState<BlastJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    deviceId: '', name: '', message: '', groupId: '', templateId: '', scheduledAt: '',
    type: 'TEXT', mediaUrl: ''
  });
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  useEffect(() => {
    Promise.all([
      deviceAPI.list(),
      templateAPI.list(),
      contactAPI.listGroups(),
      blastAPI.list(),
    ]).then(([devR, tmplR, grpR, jobR]) => {
      setDevices(devR.data.data);
      setTemplates(tmplR.data.data);
      setGroups(grpR.data.data);
      setJobs(jobR.data.data);
    });
  }, []);

  const handleTemplateSelect = (id: string) => {
    const t = templates.find((t) => t.id === id);
    setForm((f) => ({ ...f, templateId: id, message: t?.content || f.message }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await blastAPI.create(form);
      toast.success('Blast job created!');
      const jobR = await blastAPI.list();
      setJobs(jobR.data.data);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create blast');
    } finally {
      setLoading(false);
    }
  };

  const statusColor: Record<string, string> = {
    PENDING: 'text-yellow-400',
    PROCESSING: 'text-blue-400',
    COMPLETED: 'text-brand-400',
    FAILED: 'text-red-400',
    SCHEDULED: 'text-purple-400',
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete blast "${name}"?`)) return;
    try {
      await blastAPI.deleteJob(id);
      toast.success('Blast job deleted');
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete blast');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Blast Campaign</h1>
        <p className="text-gray-400 mt-1">Send bulk WhatsApp messages to a contact group</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Create form */}
        <form onSubmit={handleCreate} className="card space-y-4">
          <h2 className="section-title">New Blast</h2>

          <div>
            <label className="label">Campaign Name</label>
            <input className="input" placeholder="e.g. Promo Ramadan" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>

          <div>
            <label className="label">Device</label>
            <select className="input" value={form.deviceId}
              onChange={(e) => setForm({ ...form, deviceId: e.target.value })} required>
              <option value="">Select device...</option>
              {/* Render all devices to prevent UI flickering on temporary disconnects. */}
              {devices.map((d) => (
                <option key={d.id} value={d.id} disabled={d.status === 'QR_REQUIRED'}>
                  {d.name} {d.phoneNumber ? `(+${d.phoneNumber})` : ''} {d.status !== 'CONNECTED' ? `(${d.status.replace('_', ' ')})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Contact Group</label>
            <select className="input" value={form.groupId}
              onChange={(e) => setForm({ ...form, groupId: e.target.value })} required>
              <option value="">All contacts</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Message Type</label>
            <select className="input" value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="TEXT">Text</option>
              <option value="IMAGE">Image</option>
              <option value="DOCUMENT">Document</option>
            </select>
          </div>

          {form.type !== 'TEXT' && (
            <div>
              <label className="label">Media URL</label>
              <div className="flex flex-col sm:flex-row gap-2">
                  <input className="input flex-1" placeholder="https://..." value={form.mediaUrl}
                    onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })} />
                  <button 
                      type="button"
                      onClick={() => setShowMediaSelector(true)}
                      className="btn-secondary !text-xs whitespace-nowrap justify-center"
                  >
                      📁 Library
                  </button>
              </div>
            </div>
          )}

          <div>
            <label className="label">Template (optional)</label>
            <select className="input" value={form.templateId}
              onChange={(e) => handleTemplateSelect(e.target.value)}>
              <option value="">None</option>
              {templates.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Message</label>
            <textarea className="input min-h-[110px] resize-y" placeholder="Use {{name}} for variables"
              value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            <p className="text-xs text-gray-500 mt-1">Available vars: {'{{name}}'}, {'{{phone}}'}, {'{{email}}'}</p>
          </div>

          <div>
            <label className="label">Schedule (optional)</label>
            <input type="datetime-local" className="input" value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
          </div>

          <button type="submit" className="btn-primary w-full justify-center" disabled={loading}>
            {loading ? 'Creating…' : '📢 Create Blast Campaign'}
          </button>
        </form>

        {showMediaSelector && (
            <MediaSelector 
                onSelect={(url) => {
                    setForm({ ...form, mediaUrl: url });
                    setShowMediaSelector(false);
                }}
                onClose={() => setShowMediaSelector(false)}
            />
        )}

        {/* Job history */}
        <div className="card">
          <h2 className="section-title mb-4">Blast History</h2>
          {jobs.length === 0 ? (
            <p className="text-gray-500 text-sm">No blast jobs yet.</p>
          ) : (
            <div className="space-y-3">
              {jobs.map((j) => (
                <div key={j.id} className="p-4 bg-gray-800 rounded-xl border border-gray-700/50">
                  <div className="flex justify-between items-start gap-2">
                    <p className="font-bold text-white text-sm sm:text-base leading-tight truncate">{j.name}</p>
                    <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${statusColor[j.status]}`}>{j.status}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[10px] sm:text-xs text-gray-500">
                    <span className="flex items-center gap-1">📱 {j.device?.name}</span>
                    <span>👥 {j._count?.recipients ?? 0} recipients</span>
                    <span>📅 {format(new Date(j.createdAt), 'dd MMM, HH:mm')}</span>
                    <button onClick={() => handleDelete(j.id, j.name)}
                      className="ml-auto text-red-400 hover:text-red-300 transition-colors" title="Delete">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { templateAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface Template { id: string; name: string; content: string; variables: string[] | null; updatedAt: string }

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(null);
  const [form, setForm] = useState({ name: '', content: '', variables: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [templatePage, setTemplatePage] = useState(1);
  const [templateHasMore, setTemplateHasMore] = useState(false);
  const [templateLoadingMore, setTemplateLoadingMore] = useState(false);

  const load = async (append = false) => {
    const targetPage = append ? templatePage + 1 : 1;
    const r = await templateAPI.list({ page: targetPage, pageSize: 20 });
    if (append) {
      setTemplates(prev => [...prev, ...r.data.data]);
      setTemplatePage(targetPage);
    } else {
      setTemplates(r.data.data);
      setTemplatePage(1);
    }
    setTemplateHasMore(targetPage < r.data.pagination.totalPages);
    if (!append) setLoading(false);
  };

  const handleLoadMoreTemplates = async () => {
    setTemplateLoadingMore(true);
    await load(true);
    setTemplateLoadingMore(false);
  };

  useEffect(() => { load(); }, []);

  const extractVars = (content: string) =>
    Array.from(new Set(content.match(/\{\{(\w+)\}\}/g)?.map((v) => v.replace(/[{}]/g, '')) || []));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const variables = extractVars(form.content);
    try {
      if (selected) {
        await templateAPI.update(selected.id, { name: form.name, content: form.content, variables });
        toast.success('Template updated');
      } else {
        await templateAPI.create({ name: form.name, content: form.content, variables });
        toast.success('Template created');
      }
      setSelected(null);
      setForm({ name: '', content: '', variables: '' });
      load();
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const handleEdit = (t: Template) => {
    setSelected(t);
    setForm({ name: t.name, content: t.content, variables: t.variables?.join(', ') || '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete template?')) return;
    await templateAPI.delete(id);
    toast.success('Deleted');
    if (selected?.id === id) { setSelected(null); setForm({ name: '', content: '', variables: '' }); }
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Templates</h1>
        <p className="text-gray-400 mt-1">Create reusable message templates with variables</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Template list */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Templates</h2>
            <button className="btn-secondary text-sm" onClick={() => { setSelected(null); setForm({ name: '', content: '', variables: '' }); }}>
              + New
            </button>
          </div>
          {loading ? <p className="text-gray-500 text-sm">Loading…</p> :
            templates.length === 0 ? <p className="text-gray-500 text-sm">No templates yet.</p> : (
              <div className="space-y-2">
                {templates.map((t) => (
                  <div key={t.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors border ${selected?.id === t.id ? 'bg-brand-900/30 border-brand-600' : 'bg-gray-800 border-transparent hover:border-gray-600'}`}
                    onClick={() => handleEdit(t)}>
                    <p className="font-medium text-white text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{t.content.slice(0, 60)}…</p>
                    {t.variables && t.variables.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {t.variables.map((v) => (
                          <span key={v} className="text-xs px-1.5 py-0.5 bg-gray-700 text-gray-300 rounded">{'{{'}{v}{'}}'}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {templateHasMore && (
              <button
                onClick={handleLoadMoreTemplates}
                disabled={templateLoadingMore}
                className="w-full text-center py-3 text-sm text-brand-400 hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50 mt-2"
              >
                {templateLoadingMore ? 'Loading…' : 'Muat Lebih Banyak'}
              </button>
            )}
        </div>

        {/* Editor */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">{selected ? 'Edit Template' : 'New Template'}</h2>
            {selected && (
              <button onClick={() => handleDelete(selected.id)} className="btn-danger text-sm">Delete</button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="label">Template Name</label>
              <input className="input" placeholder="e.g. Welcome Message" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div>
              <label className="label">Content</label>
              <textarea className="input min-h-[180px] resize-y font-mono text-sm"
                placeholder={'Hi {{name}},\n\nWelcome to our service!\n\nBest regards,\nTeam'}
                value={form.content}
                onChange={(e) => {
                  const content = e.target.value;
                  setForm({ ...form, content, variables: extractVars(content).join(', ') });
                }} required />
              <p className="text-xs text-gray-500 mt-1">Use {'{{variable}}'} syntax for dynamic values</p>
            </div>

            <div>
              <label className="label">Detected Variables</label>
              <input className="input bg-gray-700/50 text-gray-400" readOnly value={form.variables || 'None detected'} />
            </div>

            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
                {saving ? 'Saving…' : selected ? '💾 Update Template' : '✨ Create Template'}
              </button>
              {selected && (
                <button type="button" onClick={() => { setSelected(null); setForm({ name: '', content: '', variables: '' }); }}
                  className="btn-secondary">Cancel</button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

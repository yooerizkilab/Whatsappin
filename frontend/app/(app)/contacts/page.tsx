'use client';

import { useEffect, useState, useCallback } from 'react';
import { contactAPI, tagAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { useDropzone } from 'react-dropzone';
import TagManager from '@/components/TagManager';
import { isValidPhoneNumber, formatPhoneE164 } from '@/utils/phone';

interface Tag { id: string; name: string; color: string }
interface Contact { id: string; name: string; phone: string; email?: string; group?: { name: string }; tags: Tag[] }
interface Group { id: string; name: string }

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', groupId: '', tagIds: [] as string[] });
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const load = async () => {
    const [cR, gR, tR] = await Promise.all([
        contactAPI.list({ 
            groupId: selectedGroup || undefined, 
            tagId: selectedTag || undefined 
        }), 
        contactAPI.listGroups(),
        tagAPI.list()
    ]);
    setContacts(cR.data.data);
    setGroups(gR.data.data);
    setTags(tR.data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [selectedGroup, selectedTag]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhoneNumber(form.phone)) {
        return toast.error('Format nomor telepon tidak valid.');
    }
    try {
      await contactAPI.create({ ...form, phone: formatPhoneE164(form.phone) });
      toast.success('Contact added');
      setForm({ name: '', phone: '', email: '', groupId: '', tagIds: [] });
      load();
    } catch { toast.error('Failed to add contact'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this contact?')) return;
    await contactAPI.delete(id);
    toast.success('Deleted');
    load();
  };

  const handleCreateGroup = async () => {
    if (!newGroup.trim()) return;
    try { await contactAPI.createGroup(newGroup.trim()); setNewGroup(''); load(); toast.success('Group created'); }
    catch { toast.error('Failed'); }
  };

  const handleDeleteGroup = async (id: string, name: string) => {
    if (!confirm(`Delete group "${name}"? Contacts in this group will not be deleted.`)) return;
    try { await contactAPI.deleteGroup(id); load(); toast.success('Group deleted'); }
    catch { toast.error('Failed to delete group'); }
  };

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setImporting(true);
    try {
      const res = await contactAPI.importCsv(file, selectedGroup || undefined);
      toast.success(res.data.message);
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Import failed');
    } finally { setImporting(false); }
  }, [selectedGroup]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'text/csv': ['.csv'] }, maxFiles: 1,
  });

  return (
    <div className="space-y-6">
      <div className="pb-2">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Contacts</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">Manage your contact directory and groups</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left panel */}
        <div className="space-y-4">
          {/* Groups */}
          <div className="card">
            <h2 className="section-title mb-3">Groups</h2>
            <div className="space-y-1 mb-3">
              <button
                onClick={() => setSelectedGroup('')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!selectedGroup ? 'bg-brand-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
              >All Contacts ({contacts.length})</button>
              {groups.map((g) => (
                <div key={g.id} className="flex items-center gap-1">
                  <button onClick={() => setSelectedGroup(g.id)}
                    className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedGroup === g.id ? 'bg-brand-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}
                  >{g.name}</button>
                  <button onClick={() => handleDeleteGroup(g.id, g.name)}
                    className="text-red-400/60 hover:text-red-300 transition-colors text-xs p-1.5 rounded-lg hover:bg-red-900/20" title="Delete group">
                    🗑️
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input flex-1 text-sm" placeholder="New group..." value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)} />
              <button className="btn-primary text-sm px-3" onClick={handleCreateGroup}>+</button>
            </div>
          </div>

          {/* Tags Filter */}
          <div className="card">
            <h2 className="section-title mb-3">Segments / Tags</h2>
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button
                onClick={() => setSelectedTag('')}
                className={`px-3 py-1 rounded-full text-xs transition-colors ${!selectedTag ? 'bg-brand-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
              >All Segments</button>
              {tags.map((t) => (
                <button 
                    key={t.id} 
                    onClick={() => setSelectedTag(t.id)}
                    className={`px-3 py-1 rounded-full text-xs transition-colors border ${selectedTag === t.id ? 'bg-brand-700 text-white border-brand-600' : 'bg-transparent text-gray-400 border-gray-800 hover:border-gray-600'}`}
                >
                    <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }}></span>
                        {t.name}
                    </span>
                </button>
              ))}
            </div>
          </div>

          <TagManager />

          {/* CSV Import */}
          <div className="card">
            <h2 className="section-title mb-3">Import CSV</h2>
            <div {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${isDragActive ? 'border-brand-400 bg-brand-900/20' : 'border-gray-700 hover:border-gray-500'}`}>
              <input {...getInputProps()} />
              <p className="text-sm text-gray-400">
                {importing ? 'Importing…' : isDragActive ? 'Drop CSV here' : 'Drop CSV or click to import'}
              </p>
              <p className="text-xs text-gray-600 mt-1">Columns: name, phone, email (link, group, dll otomatis)</p>
            </div>
            <a href="/contact-template.csv" download
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-brand-400 hover:text-brand-300 transition-colors">
              📄 Download template CSV
            </a>
          </div>

          {/* Add contact */}
          <form onSubmit={handleCreate} className="card space-y-3">
            <h2 className="section-title">Add Contact</h2>
            <input className="input text-sm" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input text-sm" placeholder="Phone (e.g. 628123...)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <input className="input text-sm" placeholder="Email (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <select className="input text-sm" value={form.groupId} onChange={(e) => setForm({ ...form, groupId: e.target.value })}>
              <option value="">No group</option>
              {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            
            <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Assign Tags</label>
                <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                        <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                                const newIds = form.tagIds.includes(tag.id)
                                    ? form.tagIds.filter(id => id !== tag.id)
                                    : [...form.tagIds, tag.id];
                                setForm({ ...form, tagIds: newIds });
                            }}
                            className={`px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${
                                form.tagIds.includes(tag.id) 
                                ? 'bg-brand-600/20 border-brand-500 text-brand-400' 
                                : 'bg-gray-800/30 border-gray-700 text-gray-500 hover:border-gray-600'
                            }`}
                        >
                            {tag.name}
                        </button>
                    ))}
                </div>
            </div>
            
            <button type="submit" className="btn-primary w-full justify-center text-sm">Add Contact</button>
          </form>
        </div>

        {/* Contact list */}
        <div className="lg:col-span-2 card">
          <h2 className="section-title mb-4">Contacts ({contacts.length})</h2>
          {loading ? <p className="text-gray-500 text-sm">Loading…</p>
            : contacts.length === 0 ? <p className="text-gray-500 text-sm">No contacts found.</p>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-800">
                      <th className="pb-2 pr-4 text-xs">Name</th>
                      <th className="pb-2 pr-4 text-xs">Phone</th>
                      <th className="pb-2 pr-4 text-xs">Group</th>
                      <th className="pb-2 pr-4 text-xs">Segments</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {contacts.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-800/30 transition-colors">
                        <td className="py-2.5 pr-4 font-medium text-white">{c.name}</td>
                        <td className="py-2.5 pr-4 text-gray-400">{c.phone}</td>
                        <td className="py-2.5 pr-4 text-gray-400">
                            <span className="px-2 py-0.5 rounded bg-gray-900 border border-gray-800 text-[10px]">
                                {c.group?.name || 'No Group'}
                            </span>
                        </td>
                        <td className="py-2.5 pr-4">
                            <div className="flex flex-wrap gap-1">
                                {c.tags?.map(t => (
                                    <span 
                                        key={t.id} 
                                        className="px-1.5 py-0.5 rounded text-[10px] font-medium border"
                                        style={{ backgroundColor: `${t.color}15`, borderColor: `${t.color}40`, color: t.color }}
                                    >
                                        {t.name}
                                    </span>
                                ))}
                            </div>
                        </td>
                        <td className="py-2.5">
                          <button onClick={() => handleDelete(c.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

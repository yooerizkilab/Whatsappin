'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { autoResponderAPI } from '@/services/api';

// ── Types ─────────────────────────────────────────────────
interface Rule {
  id: string;
  keywords: string;
  matchType: string;
  response: string;
  order: number;
  isActive: boolean;
}

interface AutoResponder {
  id: string;
  name: string;
  isActive: boolean;
  aiProvider: string | null;
  aiModel: string | null;
  apiKey: string | null;
  systemPrompt: string | null;
  device: { id: string; name: string; phoneNumber: string | null; status: string };
  rules: Rule[];
}

const MATCH_TYPES = ['CONTAINS', 'EXACT', 'STARTSWITH', 'REGEX'];

const AI_PROVIDERS = [
  { value: '', label: '— Tidak Aktif —' },
  {
    value: 'openai',
    label: 'OpenAI (ChatGPT)',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  {
    value: 'anthropic',
    label: 'Anthropic (Claude)',
    models: ['claude-3-haiku-20240307', 'claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
  },
  {
    value: 'gemini',
    label: 'Google Gemini',
    models: [
      'gemini-flash-latest',
      'gemini-pro-latest',
      'gemini-2.0-flash',
      'gemini-2.5-flash',
      'gemini-2.5-pro',
    ],
  },
];

const AI_PROVIDER_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Google Gemini',
};

// ── Main Page ─────────────────────────────────────────────
export default function AutoResponderDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [ar, setAr] = useState<AutoResponder | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'keywords' | 'ai'>('keywords');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Rules state
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editRule, setEditRule] = useState<Rule | null>(null);
  const [ruleForm, setRuleForm] = useState({ keywords: '', matchType: 'CONTAINS', response: '', order: 0, isActive: true });
  const [savingRule, setSavingRule] = useState(false);

  // AI settings state
  const [aiForm, setAiForm] = useState({ aiProvider: '', aiModel: '', apiKey: '', systemPrompt: '' });
  const [savingAi, setSavingAi] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await autoResponderAPI.getById(id);
      const data: AutoResponder = res.data.data;
      setAr(data);
      setAiForm({
        aiProvider: data.aiProvider || '',
        aiModel: data.aiModel || '',
        apiKey: data.apiKey || '',
        systemPrompt: data.systemPrompt || '',
      });
    } catch {
      setError('Failed to load auto-responder');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const flash = (msg: string, isError = false) => {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 3000);
  };

  // ── Rule handlers ────────────────────────────────────────
  const openCreateRule = () => {
    setEditRule(null);
    setRuleForm({ keywords: '', matchType: 'CONTAINS', response: '', order: (ar?.rules.length ?? 0), isActive: true });
    setShowRuleModal(true);
  };

  const openEditRule = (rule: Rule) => {
    setEditRule(rule);
    setRuleForm({ keywords: rule.keywords, matchType: rule.matchType, response: rule.response, order: rule.order, isActive: rule.isActive });
    setShowRuleModal(true);
  };

  const saveRule = async () => {
    if (!ruleForm.keywords.trim() || !ruleForm.response.trim()) return;
    setSavingRule(true);
    try {
      if (editRule) {
        await autoResponderAPI.updateRule(id, editRule.id, ruleForm);
        flash('Rule diperbarui');
      } else {
        await autoResponderAPI.createRule(id, ruleForm);
        flash('Rule ditambahkan');
      }
      setShowRuleModal(false);
      load();
    } catch (err: any) {
      flash(err.response?.data?.message || 'Gagal menyimpan rule', true);
    } finally {
      setSavingRule(false);
    }
  };

  const toggleRule = async (rule: Rule) => {
    try {
      await autoResponderAPI.updateRule(id, rule.id, { isActive: !rule.isActive });
      load();
    } catch { flash('Gagal update status rule', true); }
  };

  const deleteRule = async (rule: Rule) => {
    if (!confirm(`Hapus rule "${rule.keywords}"?`)) return;
    try {
      await autoResponderAPI.deleteRule(id, rule.id);
      flash('Rule dihapus');
      load();
    } catch { flash('Gagal menghapus rule', true); }
  };

  // ── AI handlers ──────────────────────────────────────────
  const saveAiSettings = async () => {
    setSavingAi(true);
    try {
      await autoResponderAPI.update(id, {
        aiProvider: aiForm.aiProvider || null,
        aiModel: aiForm.aiModel || null,
        apiKey: aiForm.apiKey || null,
        systemPrompt: aiForm.systemPrompt || null,
      });
      flash('Pengaturan AI disimpan');
      load();
    } catch { flash('Gagal menyimpan pengaturan AI', true); }
    finally { setSavingAi(false); }
  };

  const selectedProvider = AI_PROVIDERS.find((p) => p.value === aiForm.aiProvider);

  if (loading) return <div className="text-center py-16 text-gray-500">Memuat...</div>;
  if (!ar) return <div className="text-center py-16 text-red-400">Auto-responder tidak ditemukan</div>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button onClick={() => router.push('/auto-responder')} className="text-sm text-gray-500 hover:text-white mb-5 flex items-center gap-1">
        ← Kembali
      </button>

      {/* Header */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{ar.name}</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 flex flex-wrap items-center gap-2">
              <span>📱 {ar.device.name}</span>
              {ar.device.phoneNumber && <span>· {ar.device.phoneNumber}</span>}
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${ar.device.status === 'CONNECTED' ? 'bg-green-900/50 text-green-400' : 'bg-gray-800 text-gray-500'}`}>
                {ar.device.status}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 self-start sm:self-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-800 w-full sm:w-auto">
            <div className={`w-2 h-2 rounded-full ${ar.isActive ? 'bg-green-400' : 'bg-gray-600'}`} />
            {ar.isActive ? 'Aktif' : 'Nonaktif'}
          </div>
        </div>
      </div>

      {/* Notification */}
      {(error || success) && (
        <div className={`mb-4 p-3 rounded-lg text-sm border ${error ? 'bg-red-900/40 border-red-700 text-red-300' : 'bg-green-900/40 border-green-700 text-green-300'}`}>
          {error || success}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-xl p-1">
        {(['keywords', 'ai'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${tab === t ? 'bg-brand-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            {t === 'keywords' ? '📋 Keyword Rules' : '✨ AI Settings'}
          </button>
        ))}
      </div>

      {/* ── Tab: Keywords ─────────────────────────────────── */}
      {tab === 'keywords' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <p className="text-xs sm:text-sm text-gray-400">
              Pesan yang cocok dengan keyword akan dibalas otomatis. Diproses berdasarkan urutan.
            </p>
            <button onClick={openCreateRule} className="btn-primary text-sm whitespace-nowrap w-full sm:w-auto justify-center">
              + Tambah Rule
            </button>
          </div>

          {ar.rules.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-700 rounded-xl text-gray-500">
              Belum ada keyword rule. Klik &quot;Tambah Rule&quot; untuk memulai.
            </div>
          ) : (
            <div className="space-y-3">
              {ar.rules.map((rule, i) => (
                <div key={rule.id} className={`bg-gray-900 border rounded-xl p-4 transition-all ${rule.isActive ? 'border-gray-700' : 'border-gray-800 opacity-60'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-gray-800 text-gray-400 text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          {rule.keywords.split(',').map((kw, ki) => (
                            <span key={ki} className="px-2 py-0.5 rounded bg-brand-900/60 border border-brand-800 text-brand-300 text-[10px] sm:text-xs font-mono">
                              {kw.trim()}
                            </span>
                          ))}
                          <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 text-[10px] sm:text-xs">
                            {rule.matchType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 whitespace-pre-wrap">{rule.response}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-gray-800">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEditRule(rule)} className="text-xs text-gray-400 hover:text-white px-2 py-1.5 rounded hover:bg-gray-800">
                          Edit
                        </button>
                        <button onClick={() => deleteRule(rule)} className="text-xs text-red-500 hover:text-red-300 px-2 py-1.5 rounded hover:bg-red-900/30">
                          Hapus
                        </button>
                      </div>
                      
                      <button
                        onClick={() => toggleRule(rule)}
                        className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative ${rule.isActive ? 'bg-brand-600' : 'bg-gray-700'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${rule.isActive ? 'left-[18px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: AI Settings ──────────────────────────────── */}
      {tab === 'ai' && (
        <div className="space-y-5">
          <p className="text-sm text-gray-400">
            Jika tidak ada keyword yang cocok, pesan akan diteruskan ke AI dan jawabannya dikirimkan sebagai balasan otomatis.
          </p>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">AI Provider</label>
            <select
              className="input w-full"
              value={aiForm.aiProvider}
              onChange={(e) => setAiForm({ ...aiForm, aiProvider: e.target.value, aiModel: '' })}
            >
              {AI_PROVIDERS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>

          {aiForm.aiProvider && (
            <div>
              <label className="block text-sm text-gray-400 mb-1.5">Model</label>
              <select
                className="input w-full"
                value={aiForm.aiModel}
                onChange={(e) => setAiForm({ ...aiForm, aiModel: e.target.value })}
              >
                <option value="">-- Pilih Model --</option>
                {selectedProvider?.models?.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">System Prompt</label>
            <textarea
              className="input w-full h-24 resize-none"
              placeholder="Kamu adalah asisten toko online yang ramah. Jawab pertanyaan singkat dan sopan dalam Bahasa Indonesia."
              value={aiForm.systemPrompt}
              onChange={(e) => setAiForm({ ...aiForm, systemPrompt: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5 flex items-center gap-2">
              {aiForm.aiProvider ? AI_PROVIDER_LABELS[aiForm.aiProvider] : 'AI'} API Key
            </label>
            <input
              type="password"
              className="input w-full"
              placeholder={`Masukkan API Key ${aiForm.aiProvider ? AI_PROVIDER_LABELS[aiForm.aiProvider] : ''} khusus untuk device ini`}
              value={aiForm.apiKey}
              onChange={(e) => setAiForm({ ...aiForm, apiKey: e.target.value })}
            />
            <p className="text-[10px] text-gray-600 mt-1">
              Jika diisi, model akan menggunakan key ini. Jika kosong, akan menggunakan key default dari server.
            </p>
          </div>

          {/* API Key info box */}
          {aiForm.aiProvider && (
            <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 text-xs text-gray-400 space-y-1">
              <p className="font-semibold text-gray-300">🔑 Konfigurasi API Key</p>
              {aiForm.aiProvider === 'openai' && <p>Set <code className="text-green-400">OPENAI_API_KEY</code> di file <code>backend/.env</code></p>}
              {aiForm.aiProvider === 'anthropic' && <p>Set <code className="text-green-400">ANTHROPIC_API_KEY</code> di file <code>backend/.env</code></p>}
              {aiForm.aiProvider === 'gemini' && <p>Set <code className="text-green-400">GEMINI_API_KEY</code> di file <code>backend/.env</code></p>}
            </div>
          )}

          <button
            onClick={saveAiSettings}
            disabled={savingAi}
            className="btn-primary w-full"
          >
            {savingAi ? 'Menyimpan...' : 'Simpan Pengaturan AI'}
          </button>
        </div>
      )}

      {/* ── Rule Modal ────────────────────────────────────── */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-4">{editRule ? 'Edit Rule' : 'Tambah Keyword Rule'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Keywords <span className="text-gray-600">(pisahkan dengan koma)</span>
                </label>
                <input
                  className="input w-full"
                  placeholder="halo, hi, hai"
                  value={ruleForm.keywords}
                  onChange={(e) => setRuleForm({ ...ruleForm, keywords: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Match Type</label>
                <select
                  className="input w-full"
                  value={ruleForm.matchType}
                  onChange={(e) => setRuleForm({ ...ruleForm, matchType: e.target.value })}
                >
                  {MATCH_TYPES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  CONTAINS: teks mengandung keyword · EXACT: sama persis · STARTSWITH: diawali keyword · REGEX: ekspresi reguler
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Balasan Otomatis</label>
                <textarea
                  className="input w-full h-28 resize-none"
                  placeholder="Halo! Terima kasih sudah menghubungi kami. Ada yang bisa kami bantu?"
                  value={ruleForm.response}
                  onChange={(e) => setRuleForm({ ...ruleForm, response: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-sm text-gray-400 mb-1">Urutan</label>
                  <input
                    type="number"
                    className="input w-full"
                    value={ruleForm.order}
                    onChange={(e) => setRuleForm({ ...ruleForm, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-center gap-2 mt-5">
                  <label className="text-sm text-gray-400">Aktif</label>
                  <button
                    onClick={() => setRuleForm({ ...ruleForm, isActive: !ruleForm.isActive })}
                    className={`w-9 h-5 rounded-full transition-colors relative ${ruleForm.isActive ? 'bg-brand-600' : 'bg-gray-700'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${ruleForm.isActive ? 'left-[18px]' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                className="btn-primary flex-1"
                onClick={saveRule}
                disabled={savingRule || !ruleForm.keywords.trim() || !ruleForm.response.trim()}
              >
                {savingRule ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button className="btn-secondary flex-1" onClick={() => setShowRuleModal(false)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

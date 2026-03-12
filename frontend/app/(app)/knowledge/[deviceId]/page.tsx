'use client';

import { useEffect, useState } from 'react';
import { knowledgeAPI } from '@/services/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface Source {
  id: string;
  type: string;
  url: string | null;
  status: string;
  createdAt: string;
}

interface KnowledgeBase {
  id: string;
  name: string;
  deviceId: string;
  sources: Source[];
}

export default function KnowledgeDetailPage({ params }: { params: { deviceId: string } }) {
  const [kb, setKb] = useState<KnowledgeBase | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState('');
  const [newText, setNewText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchKnowledge();
  }, [params.deviceId]);

  const fetchKnowledge = async () => {
    try {
      const res = await knowledgeAPI.get(params.deviceId);
      setKb(res.data);
    } catch (error) {
      console.error('Failed to fetch knowledge base', error);
      toast.error('Gagal mengambil data pengetahun');
    } finally {
      setLoading(false);
    }
  };

  const handleInitKB = async () => {
    try {
      setIsProcessing(true);
      await knowledgeAPI.create({
        deviceId: params.deviceId,
        name: `Agent for ${params.deviceId}`
      });
      toast.success('Knowledge base diinisialisasi');
      fetchKnowledge();
    } catch (err) {
      toast.error('Gagal membuat knowledge base');
    } finally {
      setIsProcessing(false);
    }
  };

  const addUrlSource = async () => {
    if (!newUrl || !kb) return;
    try {
      setIsProcessing(true);
      await knowledgeAPI.addSource({
        kbId: kb.id,
        type: 'URL',
        url: newUrl
      });
      toast.success('Penganbilan data dimulai...');
      setNewUrl('');
      fetchKnowledge();
    } catch (err) {
      toast.error('Gagal menambahkan URL');
    } finally {
      setIsProcessing(false);
    }
  };

  const addTextSource = async () => {
    if (!newText || !kb) return;
    try {
      setIsProcessing(true);
      await knowledgeAPI.addSource({
        kbId: kb.id,
        type: 'TEXT',
        content: newText
      });
      toast.success('Teks berhasil ditambahkan');
      setNewText('');
      fetchKnowledge();
    } catch (err) {
      toast.error('Gagal menambahkan teks');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteSource = async (id: string) => {
    if (!confirm('Hapus sumber ini?')) return;
    try {
      await knowledgeAPI.deleteSource(id);
      toast.success('Sumber dihapus');
      fetchKnowledge();
    } catch (err) {
      toast.error('Gagal menghapus sumber');
    }
  };

  if (loading) return <div className="animate-pulse">Loading knowledge...</div>;

  if (!kb?.id) {
    return (
        <div className="bg-gray-900 rounded-3xl p-12 text-center border border-gray-800">
            <h2 className="text-2xl font-bold text-white mb-2">Inisialisasi Agen AI</h2>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">Perangkat ini belum memiliki Agen AI. Klik tombol di bawah untuk memulai pelatihan.</p>
            <button 
                onClick={handleInitKB}
                disabled={isProcessing}
                className="btn-primary"
            >
                {isProcessing ? 'Memproses...' : '🚀 Aktifkan Agen AI'}
            </button>
        </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
        <h1 className="text-2xl font-bold text-white">Latih Agen AI: {kb.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* URL Scraping */}
        <div className="space-y-6">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                <h3 className="text-lg font-bold text-white mb-1">Crawl Website</h3>
                <p className="text-sm text-gray-500 mb-6">Masukkan URL website bisnis Anda (misal: sitemap atau halaman produk).</p>
                <div className="flex gap-2">
                    <input 
                        type="url" 
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        placeholder="https://toko.com/info"
                        className="flex-1 bg-gray-950 border border-gray-800 rounded-xl px-4 py-2 text-sm focus:border-brand-500 outline-none"
                    />
                    <button 
                        onClick={addUrlSource}
                        disabled={isProcessing || !newUrl}
                        className="px-6 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all"
                    >
                        Learn
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                <h3 className="text-lg font-bold text-white mb-1">Input Teks Manual</h3>
                <p className="text-sm text-gray-500 mb-6">Tempel teks mengenai produk, FAQ, atau kebijakan bisnis Anda.</p>
                <textarea 
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    rows={6}
                    placeholder="Contoh: Kami melayani pengiriman gratis untuk wilayah Jakarta..."
                    className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:border-brand-500 outline-none mb-4"
                />
                <button 
                    onClick={addTextSource}
                    disabled={isProcessing || !newText}
                    className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-bold transition-all"
                >
                    Add Text Data
                </button>
            </div>
        </div>

        {/* Source List */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 h-fit">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
                <span>Sumber Pengetahuan</span>
                <span className="text-xs font-normal text-gray-500">{kb.sources.length} sources</span>
            </h3>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {kb.sources.map((source) => (
                    <div key={source.id} className="p-4 bg-gray-950 border border-gray-800 rounded-xl flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded uppercase">{source.type}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                    source.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500' :
                                    source.status === 'FAILED' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'
                                }`}>
                                    {source.status}
                                </span>
                            </div>
                            <p className="text-xs text-brand-400 truncate">{source.url || 'Manual Text Data'}</p>
                            <p className="text-[10px] text-gray-600 mt-1">{new Date(source.createdAt).toLocaleString()}</p>
                        </div>
                        <button 
                            onClick={() => deleteSource(source.id)}
                            className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                        >
                            🗑️
                        </button>
                    </div>
                ))}
                {kb.sources.length === 0 && (
                    <div className="text-center py-12 text-gray-600 italic">Belum ada data pelatihan.</div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

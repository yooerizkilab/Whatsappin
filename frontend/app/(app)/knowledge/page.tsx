'use client';

import { useEffect, useState } from 'react';
import { deviceAPI } from '@/services/api';
import Link from 'next/link';

interface Device {
  id: string;
  name: string;
  phoneNumber: string | null;
  status: string;
}

export default function KnowledgeBasePage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await deviceAPI.list();
      setDevices(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch devices', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="animate-pulse">Loading devices...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white">🧠 AI Sales Agent (RAG)</h1>
        <p className="text-gray-400">
          Latih AI Anda dengan pengetahuan bisnis (Website, Teks, Dokumen) untuk menjawab pelanggan secara otomatis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device) => (
          <div 
            key={device.id} 
            className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col justify-between hover:border-brand-500/50 transition-colors shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                  device.status === 'CONNECTED' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                }`}>
                  {device.status}
                </div>
                <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center text-xl">🤖</div>
              </div>
              <h3 className="text-lg font-bold text-white truncate">{device.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{device.phoneNumber || 'No phone linked'}</p>
            </div>

            <Link 
              href={`/knowledge/${device.id}`}
              className="w-full py-2.5 bg-gray-800 hover:bg-brand-600 hover:text-white text-gray-300 rounded-xl text-sm font-bold transition-all text-center flex items-center justify-center gap-2"
            >
              <span>Manage Knowledge</span>
              <span>→</span>
            </Link>
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="bg-gray-900 border border-dashed border-gray-800 rounded-2xl p-12 text-center">
            <p className="text-gray-500">No devices found. Please connect a device first.</p>
            <Link href="/devices" className="text-brand-500 font-bold mt-2 inline-block">Connect Device</Link>
        </div>
      )}
    </div>
  );
}

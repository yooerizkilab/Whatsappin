'use client';

import ApiKeyManager from '@/components/ApiKeyManager';
import ProfileManager from '@/components/ProfileManager';

export default function SettingsPage() {
    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="page-title">Settings</h1>
                <p className="text-gray-400 mt-1">Manage your account preferences and developer keys</p>
            </div>

            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center text-brand-500">
                        👤
                    </div>
                    <h2 className="text-xl font-bold text-white">Your Profile</h2>
                </div>
                
                <ProfileManager />
            </section>

            <section>
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center text-brand-500">
                        🔑
                    </div>
                    <h2 className="text-xl font-bold text-white">Developer API Keys</h2>
                </div>
                
                <ApiKeyManager />
            </section>
        </div>
    );
}

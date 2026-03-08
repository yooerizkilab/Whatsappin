import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    setUser: (user: User) => void;
    logout: () => void;
    initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,

    setAuth: (user, token) => {
        localStorage.setItem('wa_token', token);
        localStorage.setItem('wa_user', JSON.stringify(user));
        set({ user, token, isAuthenticated: true });
    },

    setUser: (user) => {
        localStorage.setItem('wa_user', JSON.stringify(user));
        set({ user });
    },

    logout: () => {
        localStorage.removeItem('wa_token');
        localStorage.removeItem('wa_user');
        set({ user: null, token: null, isAuthenticated: false });
    },

    initFromStorage: () => {
        if (typeof window === 'undefined') return;
        const token = localStorage.getItem('wa_token');
        const userStr = localStorage.getItem('wa_user');
        if (token && userStr) {
            try {
                const user = JSON.parse(userStr);
                set({ user, token, isAuthenticated: true });
            } catch { }
        }
    },
}));

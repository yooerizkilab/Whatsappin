import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('wa_token');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401 && typeof window !== 'undefined') {
            localStorage.removeItem('wa_token');
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export default api;

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (data: any) => api.post('/auth/register', data),
    me: () => api.get('/auth/me'),
    updateProfile: (data: { name?: string; email?: string; phone?: string }) =>
        api.put('/auth/profile', data),
    changePassword: (data: { currentPassword: string; newPassword: string }) =>
        api.put('/auth/profile/password', data),
};

// ── Devices ───────────────────────────────────────────────
export const deviceAPI = {
    list: () => api.get('/devices'),
    connect: (name: string) => api.post('/devices/connect', { name }),
    delete: (id: string) => api.delete(`/devices/${id}`),
    getStatus: (id: string) => api.get(`/devices/${id}/status`),
};

// ── Messages ──────────────────────────────────────────────
export const messageAPI = {
    send: (data: { deviceId: string; to: string; content: string; type?: string; mediaUrl?: string }) =>
        api.post('/messages/send', data),
    getLogs: (params?: { deviceId?: string; status?: string; limit?: number; offset?: number }) =>
        api.get('/messages/logs', { params }),
};

// ── Chats ─────────────────────────────────────────────────
export const chatAPI = {
    getList: (deviceId: string) => api.get(`/chats?deviceId=${deviceId}`),
    getHistory: (deviceId: string, phone: string) =>
        api.get(`/chats/history?deviceId=${deviceId}&phone=${phone}`),
};

// ── Blast ─────────────────────────────────────────────────
export const blastAPI = {
    create: (data: {
        deviceId: string;
        name: string;
        message: string;
        groupId?: string;
        templateId?: string;
        scheduledAt?: string;
    }) => api.post('/messages/blast', data),
    list: () => api.get('/messages/blast'),
    getJob: (id: string) => api.get(`/messages/blast/${id}`),
};

// ── Templates ─────────────────────────────────────────────
export const templateAPI = {
    list: () => api.get('/templates'),
    create: (data: { name: string; content: string; variables?: string[] }) =>
        api.post('/templates', data),
    update: (id: string, data: Partial<{ name: string; content: string; variables: string[] }>) =>
        api.put(`/templates/${id}`, data),
    delete: (id: string) => api.delete(`/templates/${id}`),
};

// ── Contacts ──────────────────────────────────────────────
export const contactAPI = {
    list: (params?: { groupId?: string; tagId?: string }) => api.get('/contacts', { params }),
    create: (data: { name: string; phone: string; email?: string; groupId?: string; tagIds?: string[] }) =>
        api.post('/contacts', data),
    update: (id: string, data: Partial<{ name: string; phone: string; email: string; groupId: string; tagIds: string[] }>) =>
        api.put(`/contacts/${id}`, data),
    delete: (id: string) => api.delete(`/contacts/${id}`),
    importCsv: (file: File, groupId?: string) => {
        const form = new FormData();
        form.append('file', file);
        return api.post('/contacts/import', form, {
            params: { groupId },
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    listGroups: () => api.get('/contacts/groups'),
    createGroup: (name: string) => api.post('/contacts/groups', { name }),
};

// ── Tags ──────────────────────────────────────────────────
export const tagAPI = {
    list: () => api.get('/tags'),
    create: (data: { name: string; color?: string }) => api.post('/tags', data),
    update: (id: string, data: { name?: string; color?: string }) => api.put(`/tags/${id}`, data),
    delete: (id: string) => api.delete(`/tags/${id}`),
};

// ── Auto Responder ─────────────────────────────────────────
export const autoResponderAPI = {
    list: () => api.get('/auto-responder'),
    getById: (id: string) => api.get(`/auto-responder/${id}`),
    create: (data: {
        deviceId: string;
        name: string;
        isActive?: boolean;
        aiProvider?: string | null;
        aiModel?: string | null;
        systemPrompt?: string | null;
    }) => api.post('/auto-responder', data),
    update: (id: string, data: Partial<{
        name: string;
        isActive: boolean;
        aiProvider: string | null;
        aiModel: string | null;
        systemPrompt: string | null;
    }>) => api.put(`/auto-responder/${id}`, data),
    delete: (id: string) => api.delete(`/auto-responder/${id}`),

    // Rules
    createRule: (id: string, data: { keywords: string; matchType?: string; response: string; order?: number }) =>
        api.post(`/auto-responder/${id}/rules`, data),
    updateRule: (id: string, ruleId: string, data: object) =>
        api.put(`/auto-responder/${id}/rules/${ruleId}`, data),
    deleteRule: (id: string, ruleId: string) =>
        api.delete(`/auto-responder/${id}/rules/${ruleId}`),
};

// ── Webhooks ───────────────────────────────────────────────
export const webhookAPI = {
    list: () => api.get('/webhooks'),
    getById: (id: string) => api.get(`/webhooks/${id}`),
    create: (data: { deviceId: string; url: string; secret?: string }) =>
        api.post('/webhooks', data),
    update: (id: string, data: Partial<{ url: string; secret: string; isActive: boolean }>) =>
        api.put(`/webhooks/${id}`, data),
    delete: (id: string) => api.delete(`/webhooks/${id}`),
};

// ── Billing & Subscription ──────────────────────────────────
export const billingAPI = {
    getPlans: () => api.get('/billing/plans'),
    checkout: (planId: string) => api.post('/billing/checkout', { planId }),
    getMe: () => api.get('/billing/me'),
};

// ── Admin Management ────────────────────────────────────────
export const adminAPI = {
    // Plans
    getPlans: () => api.get('/admin/plans'),
    createPlan: (data: any) => api.post('/admin/plans', data),
    updatePlan: (id: string, data: any) => api.put(`/admin/plans/${id}`, data),
    deletePlan: (id: string) => api.delete(`/admin/plans/${id}`),

    // Users
    listUsers: () => api.get('/admin/users'),
    updateUserSubscription: (id: string, data: any) =>
        api.put(`/admin/users/${id}/subscription`, data),
};

// ── API Keys ──────────────────────────────────────────────
export const apiKeyAPI = {
    list: () => api.get('/api-keys'),
    create: (name: string) => api.post('/api-keys', { name }),
    delete: (id: string) => api.delete(`/api-keys/${id}`),
};

// ── Analytics ─────────────────────────────────────────────
export const analyticsAPI = {
    getSummary: () => api.get('/analytics/summary'),
    getChartData: () => api.get('/analytics/chart'),
    getBlastStats: () => api.get('/analytics/blasts'),
};

// ── Media Library ─────────────────────────────────────────
export const mediaAPI = {
    list: () => api.get('/media'),
    upload: (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return api.post('/media/upload', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
    },
    delete: (id: string) => api.delete(`/media/${id}`),
};

export const agentAPI = {
    list: () => api.get('/agents'),
    create: (data: any) => api.post('/agents', data),
    update: (id: string, data: any) => api.put(`/agents/${id}`, data),
    delete: (id: string) => api.delete(`/agents/${id}`),
};

import axios from 'axios';

const rawBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';
const API_BASE = rawBase.replace(/\/$/, '').endsWith('/api')
  ? rawBase.replace(/\/$/, '')
  : `${rawBase.replace(/\/$/, '')}/api`;

const api = axios.create({
  baseURL: API_BASE,
});
// ---- Auth token handling ----
const TOKEN_KEY = 'jwt_token';
const REFRESH_KEY = 'refresh_token';

export const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

export const setRefreshToken = (t: string) => localStorage.setItem(REFRESH_KEY, t);
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        if (data.token) {
          setToken(data.token);
          originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
          return api(originalRequest);
        }
      } catch (err) {
        clearToken();
        window.location.href = '/'; // force logout
      }
    }
    return Promise.reject(error);
  }
);

// ---------- HELPERS ----------
const normalizeSite = (s: any) => ({
  id: s.id || s._id,
  name: s.name,
  address: s.address,
  floors: s.floors,
  flatsPerFloor: s.flatsPerFloor,
  status: s.status,
  activeTasks: s.activeTasks || 0,
  completedTasks: s.completedTasks || 0,
});

const normalizeTask = (t: any) => ({
  id: t.id || t._id,
  siteId: t.site || t.siteId,
  floorId: t.floorId ?? null,
  title: t.title,
  description: t.description,
  flat: t.flat ?? null,
  room: t.room ?? null,
  category: t.category ?? 'general',
  priority: t.priority || "medium",
  status: t.status || "pending",
  assignedBy: t.assignedBy || null,
  assignedByName: t.assignedByName || null,
  assignedByRole: t.assignedByRole || null,
  dateAssigned: t.dateAssigned || null,
  imageFileId: t.imageFileId || null,
  imageUrl: t.imageUrl || (t.imageFileId ? `${API_BASE}/files/${t.imageFileId}` : null),
  createdAt: t.createdAt || null,
  updatedAt: t.updatedAt || null,
});


// ---------- AUTH ----------
export type UserRole = 'admin' | 'builder' | 'painter' | 'plumber' | 'carpenter' | 'electrician';

export const authAPI = {
  register: async (payload: { name: string; role: UserRole; email: string; password: string }) => {
    const { data } = await api.post('/auth/register', payload);
    if (data.token) setToken(data.token);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    return data;
  },
  getUserDetails: async (userId: string) => { // ✅ NEW FUNCTION
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },

  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.token) setToken(data.token);
    if (data.refreshToken) setRefreshToken(data.refreshToken);
    return data;
  },

  me: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  logout: () => clearToken(),
};

// ---------- SITES ----------
export const sitesAPI = {
  createSite: async (payload: { name: string; address: string; floors: number; flatsPerFloor: number }) => {
    const { data } = await api.post('/sites', payload);
    return normalizeSite(data);
  },

  listSites: async () => {
    const { data } = await api.get('/sites');
    return data.map((s: any) => normalizeSite(s));
  },

  getSite: async (id: string) => {
    const { data } = await api.get(`/sites/${id}`);
    return normalizeSite(data);
  },

  deleteSite: async (id: string) => {
    const { data } = await api.delete(`/sites/${id}`);
    return data;
  },
};

// ---------- TASKS ----------
export const tasksAPI = {
  createTask: async (payload: {
    siteId: string;
    floorId: string;
    title: string;
    description: string;
    flat: string;
    room: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    image?: File | null;
  }) => {
    const form = new FormData();
    form.append('siteId', payload.siteId);
    form.append('floorId', payload.floorId);
    form.append('title', payload.title);
    form.append('description', payload.description);
    form.append('flat', payload.flat);
    form.append('room', payload.room);
    form.append('category', payload.category);
    form.append('priority', payload.priority);

    if (payload.image) {
      form.append('image', payload.image);
    }

    const { data } = await api.post('/tasks', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return normalizeTask(data);
  },

  listForSite: async (siteId: string) => {
    const { data } = await api.get(`/tasks/site/${siteId}`);
    return data.map((t: any) => normalizeTask(t));
  },

  listForFloor: async (siteId: string, floorId: string) => {
    const { data } = await api.get(`/tasks/site/${siteId}/floor/${floorId}`);
    return data.map((t: any) => normalizeTask(t));
  },

  updateStatus: async (taskId: string, status: 'pending' | 'in-progress' | 'completed') => {
    const { data } = await api.patch(`/tasks/${taskId}/status`, { status });
    return normalizeTask(data);
  },

  deleteTask: async (id: string) => {
    const { data } = await api.delete(`/tasks/${id}`);
    return data;
  },

  fileUrl: (fileId: string) => `${API_BASE}/files/${fileId}`,
};
const API_BASE_URL = 'http://192.168.102.222:5000/api';
const MINIO_BASE_URL = 'http://192.168.102.222:3000';

// API Client
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    return this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: { username: string; email: string; password: string }) {
    return this.request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request<User>('/auth/me');
  }

  // Project endpoints
  async getProjects() {
    return this.request<Project[]>('/projects');
  }

  async getProject(id: string) {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(projectData: Partial<Project>) {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: Partial<Project>) {
    return this.request<Project>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, { method: 'DELETE' });
  }

  async updateProjectPermissions(id: string, permissions: ProjectPermission[]) {
    return this.request(`/projects/${id}/permissions`, {
      method: 'POST',
      body: JSON.stringify({ permissions }),
    });
  }

  // File endpoints
  async uploadFile(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/files/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed! status: ${response.status}`);
    }

    return response.json();
  }

  async getFile(id: string) {
    return this.request<Attachment>(`/files/${id}`);
  }

  async downloadFile(id: string) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${this.baseURL}/files/download/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!response.ok) {
      throw new Error(`Download failed! status: ${response.status}`);
    }

    return response.blob();
  }

  async deleteFile(id: string) {
    return this.request(`/files/${id}`, { method: 'DELETE' });
  }

  // Admin endpoints
  async getUsers() {
    return this.request<User[]>('/admin/users');
  }

  async updateUser(id: string, userData: Partial<User>) {
    return this.request<User>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async getStats() {
    return this.request<AdminStats>('/admin/stats');
  }
}

// Types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  content: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
  lastModifiedBy: string;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  installationGuide?: string;
  sourceCodeUrl?: string;
  attachments: Attachment[];
  permissions: ProjectPermission[];
  isPublic: boolean;
}

export interface Attachment {
  filename: string;
  path: string;
  type: string;
}

export interface ProjectPermission {
  userId: string;
  canEdit: boolean;
}

export interface AdminStats {
  totalUsers: number;
  totalProjects: number;
  activeUsers: number;
  recentProjects: Project[];
}

export const api = new ApiClient(API_BASE_URL);
export { MINIO_BASE_URL };
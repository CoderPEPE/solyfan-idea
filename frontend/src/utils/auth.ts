export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'creator' | 'consumer';
}

export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('rememberMe');
};

export const getAuthHeaders = (): { [key: string]: string } => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
import { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('lpres_admin_token');
    if (token) {
      adminAPI.me()
        .then((res) => setAdmin(res.data))
        .catch(() => localStorage.removeItem('lpres_admin_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    const res = await adminAPI.login(username, password);
    localStorage.setItem('lpres_admin_token', res.data.access_token);
    const me = await adminAPI.me();
    setAdmin(me.data);
    return me.data;
  };

  const logout = () => {
    localStorage.removeItem('lpres_admin_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout, isAuthenticated: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

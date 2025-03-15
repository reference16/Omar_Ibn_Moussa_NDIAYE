import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.get('users/me/')
        .then((response) => {
          setUser(response.data);
        })
        .catch(() => {
          logout();
        });
    }
  }, []);

  const getDashboardPath = (userData) => {
    const role = userData.role || (userData.is_superuser ? 'admin' : userData.is_staff ? 'teacher' : 'student');
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/login';
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('token/', {
        username,
        password
      });
      
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Récupérer les informations de l'utilisateur
      const userResponse = await axios.get('users/me/');
      const userData = userResponse.data;
      setUser(userData);
      
      // Rediriger vers le dashboard approprié
      navigate(getDashboardPath(userData));
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

import axios from "../axios";

export const login = async (username, password) => {
    try {
        const response = await axios.post("token/", { 
            username,
            password,
          });
          localStorage.setItem('access_token', response.data.access);
          localStorage.setItem('refresh_token', response.data.refresh);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
          return response.data;
        } catch (error) {
          console.error('Erreur de connexion', error);
          throw error;
        }
      };

export const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    axios.defaults.headers.common['Authorization'] = '';
  };


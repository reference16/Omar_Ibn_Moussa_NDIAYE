import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/authContext';
import { fetchProfile, updateProfile, deleteProfile } from '../services/profileService';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchProfile();
      setProfile(data);
      setUsername(data.username || '');
      setEmail(data.email || '');
    } catch (error) {
      setError('Erreur lors du chargement du profil');
      console.error('Erreur lors du chargement du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      if (avatar) {
        formData.append('avatar', avatar);
      }

      const updatedUser = await updateProfile(formData);
      setProfile(updatedUser);
      alert('✅ Profil mis à jour avec succès !');
    } catch (error) {
      setError('Erreur lors de la mise à jour du profil');
      console.error('Erreur lors de la mise à jour du profil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (window.confirm('⚠️ Es-tu sûr de vouloir supprimer ton compte ? Cette action est irréversible !')) {
      try {
        setLoading(true);
        setError('');
        await deleteProfile();
        logout();
        navigate('/login');
      } catch (error) {
        setError('Erreur lors de la suppression du compte');
        console.error('Erreur lors de la suppression du compte:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen w-screen overflow-hidden bg-gray-100">
      {/* Header */}
      <header className="bg-teal-500 text-white shadow-md w-full">
        <div className="w-full px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">FlowTask</h1>
              <span className="ml-2 px-2 py-1 text-xs bg-teal-600 rounded">Profil</span>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded text-sm"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">👤 Mon Profil</h2>
            
            {loading && !profile.username && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                <span className="ml-2 text-gray-600">Chargement du profil...</span>
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                ❌ {error}
              </div>
            )}
            
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nom d'utilisateur
                </label>
                <input 
                  id="username"
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Votre nom d'utilisateur"
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input 
                  id="email"
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Votre email"
                  className="mt-1 block w-full rounded border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
                  Avatar
                </label>
                <input 
                  id="avatar"
                  type="file" 
                  onChange={(e) => setAvatar(e.target.files[0])}
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
                {profile.avatar && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-1">Avatar actuel :</p>
                    <img 
                      src={profile.avatar} 
                      alt="Avatar actuel" 
                      className="h-20 w-20 rounded-full object-cover border-2 border-teal-300"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-2 px-4 rounded flex items-center justify-center disabled:opacity-50"
                >
                  {loading ? '⏳ Mise à jour...' : '💾 Mettre à jour'}
                </button>
                
                <button 
                  type="button"
                  onClick={handleDeleteProfile} 
                  disabled={loading}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center justify-center disabled:opacity-50"
                >
                  ❌ Supprimer mon compte
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4 text-center w-full">
        <p>© 2025 FlowTask - Plateforme de gestion de tâches</p>
      </footer>
    </div>
  );
};

export default Profile;
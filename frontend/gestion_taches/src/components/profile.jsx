import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/authContext';
import { fetchProfile, updateProfile, deleteProfile } from '../services/profileService';
import './profile.css';

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

  if (loading && !profile.username) {
    return <div className="profile-loading">⏳ Chargement du profil...</div>;
  }

  return (
    <div className="profile-container">
      <header className="profile-header">
        <h1>👤 Mon Profil</h1>
        <button 
          onClick={() => navigate('/dashboard')}
          className="back-button"
        >
          ← Retour au tableau de bord
        </button>
      </header>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      <form onSubmit={handleUpdateProfile} className="profile-form">
        <div className="form-group">
          <label htmlFor="username">Nom d'utilisateur :</label>
          <input 
            id="username"
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Votre nom d'utilisateur"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email :</label>
          <input 
            id="email"
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="avatar">Avatar :</label>
          <input 
            id="avatar"
            type="file" 
            onChange={(e) => setAvatar(e.target.files[0])}
            accept="image/*"
          />
          {profile.avatar && (
            <div className="current-avatar">
              <img src={profile.avatar} alt="Avatar actuel" />
            </div>
          )}
        </div>

        <div className="button-group">
          <button 
            type="submit"
            disabled={loading}
            className="update-button"
          >
            {loading ? '⏳ Mise à jour...' : '💾 Mettre à jour'}
          </button>

          <button 
            type="button"
            onClick={handleDeleteProfile} 
            disabled={loading}
            className="delete-button"
          >
            ❌ Supprimer mon compte
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

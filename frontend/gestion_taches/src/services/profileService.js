import axios from '../axios';

export const fetchProfile = async () => {
  try {
    const response = await axios.get('users/me/');
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement du profil:', error);
    throw error;
  }
};

export const updateProfile = async (formData) => {
  try {
    const response = await axios.patch('users/me/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw error;
  }
};

export const deleteProfile = async () => {
  try {
    await axios.delete('users/me/');
  } catch (error) {
    console.error('Erreur lors de la suppression du profil:', error);
    throw error;
  }
};

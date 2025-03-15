import axios from '../axios';

export const registerStudent = async (userData) => {
  try {
    const response = await axios.post('users/register_student/', userData);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      const errorData = error.response.data;
      if (typeof errorData === 'object') {
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        throw new Error(errorMessages);
      } else {
        throw new Error(errorData.toString());
      }
    }
    throw new Error('Une erreur est survenue lors de l\'inscription');
  }
};

export const createTeacher = async (userData) => {
  try {
    const response = await axios.post('users/create_teacher/', userData);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      const errorData = error.response.data;
      if (typeof errorData === 'object') {
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        throw new Error(errorMessages);
      } else {
        throw new Error(errorData.toString());
      }
    }
    throw new Error('Une erreur est survenue lors de la création du compte enseignant');
  }
};

export const getUsers = async () => {
  try {
    const response = await axios.get('users/');
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      throw new Error('Vous n\'avez pas les permissions nécessaires pour accéder à cette ressource');
    }
    throw new Error('Une erreur est survenue lors de la récupération des utilisateurs');
  }
};

// Nouvelle fonction pour récupérer uniquement les étudiants
export const getStudents = async () => {
  try {
    const response = await axios.get('users/students/');
    return response.data;
  } catch (error) {
    throw new Error('Une erreur est survenue lors de la récupération des étudiants');
  }
};

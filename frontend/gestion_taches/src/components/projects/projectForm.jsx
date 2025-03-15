import React, { useState, useEffect, useContext } from 'react';
import { createProject, updateProject, PROJECT_STATUS, PROJECT_STATUS_LABELS } from '../../services/projectServices';
import { fetchUsers } from '../../services/projectServices';
import AuthContext from '../../context/authContext';

const ProjectForm = ({ project, onProjectCreated, onProjectUpdated }) => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: [],
    status: PROJECT_STATUS.TODO
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const initializeData = async () => {
      if (project) {
        // Filtrage des membres existants si étudiant
        const filteredMembers = user?.role === 'student' 
          ? project.members.filter(m => m.role === 'student')
          : project.members;
        
        setFormData({
          name: project.name,
          description: project.description,
          members: filteredMembers.map(member => member.id),
          status: project.status
        });
      }
      await loadUsers();
    };
    
    initializeData();
  }, [project, user?.role]);

  const loadUsers = async () => {
    try {
      const data = await fetchUsers();
      
      // Filtrage des utilisateurs selon le rôle
      const filtered = user?.role === 'student'
        ? data.filter(u => u.role === 'student' && u.id !== user.id)
        : data;

      setUsers(filtered);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setError('Erreur lors du chargement des utilisateurs');
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleMembersChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    setFormData({
      ...formData,
      members: selectedOptions.map(option => option.value)
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Le nom du projet est requis');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      let result;
      
      if (project) {
        // Mode modification
        result = await updateProject(project.id, formData);
        if (onProjectUpdated) onProjectUpdated(result);
      } else {
        // Mode création - toujours commencer avec le statut "à faire"
        const newProjectData = {
          ...formData,
          status: PROJECT_STATUS.TODO
        };
        result = await createProject(newProjectData);
        if (onProjectCreated) onProjectCreated(result);
      }
      
      // Réinitialiser le formulaire en mode création
      if (!project) {
        setFormData({
          name: '',
          description: '',
          members: [],
          status: PROJECT_STATUS.TODO
        });
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du projet:', error);
      setError('Erreur lors de la sauvegarde du projet');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Nom du projet <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Nom du projet"
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          disabled={loading}
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description du projet"
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          rows="3"
          disabled={loading}
        />
      </div>
      
      {project && (
        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            État du projet
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
            disabled={loading || !project || user?.role === 'student'}
          >
            {Object.entries(PROJECT_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {user?.role === 'student' && (
            <p className="mt-1 text-xs text-amber-600">
              <span className="mr-1">ℹ️</span>
              Seuls les enseignants peuvent modifier l'état du projet
            </p>
          )}
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="members" className="block text-sm font-medium text-gray-700 mb-1">
          Membres
        </label>
        <select
          id="members"
          name="members"
          multiple
          value={formData.members}
          onChange={handleMembersChange}
          className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
          disabled={loading}
          size="5"
        >
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.username || user.email} ({user.role})
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Maintenir Ctrl (ou Cmd) pour sélectionner plusieurs membres
        </p>
        {user?.role === 'student' && (
          <p className="mt-2 text-xs text-amber-600">
            <span className="mr-1">ℹ️</span>
            Note : Les étudiants ne peuvent ajouter que d'autres étudiants comme membres
          </p>
        )}
      </div>
      
      <div className="flex justify-end">
        <button 
          type="submit" 
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 ${
            !loading ? 'hover:bg-teal-700' : ''
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Traitement...
            </span>
          ) : (
            <span className="flex items-center">
              {project ? '💾 Mettre à jour' : '✨ Créer le projet'}
            </span>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
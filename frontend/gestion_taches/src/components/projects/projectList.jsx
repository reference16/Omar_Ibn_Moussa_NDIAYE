import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/authContext';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';
import { fetchProjects, PROJECT_STATUS } from '../../services/projectServices';

const ProjectList = ({ role = 'student', onProjectSelect }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  useEffect(() => {
    loadProjects();
  }, []);
  
  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchProjects();
      
      // Filtrer selon le rôle et le statut du projet
      let filteredProjects = data;
      
      if (role === 'student') {
        // Étudiants: voir les projets où ils sont membres ET qui sont en cours/terminés
        // OU les projets qu'ils possèdent (quel que soit le statut)
        filteredProjects = data.filter(project => 
          (project.owner.id === user.id) || 
          (project.members.some(member => member.id === user.id) && project.status !== PROJECT_STATUS.TODO)
        );
      } else if (role === 'teacher') {
        // Enseignants: voir les projets qu'ils ont créés
        filteredProjects = data.filter(project => project.owner.id === user.id);
      }
      // Admin: voir tous les projets (pas de filtre)
      
      setProjects(filteredProjects);
    } catch (error) {
      setError('Erreur lors du chargement des projets');
      console.error('Erreur lors du chargement des projets:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleProjectCreated = (newProject) => {
    setProjects([...projects, newProject]);
    setShowCreateForm(false);
  };
  
  const handleProjectDeleted = (projectId) => {
    setProjects(projects.filter(p => p.id !== projectId));
  };

  const handleProjectUpdated = (updatedProject) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };
  
  // Modification de la permission de création
  const canCreateProject = role === 'admin' || role === 'teacher' || role === 'student'; 
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <span className="mr-2">📁</span> Mes Projets
        </h2>
        {canCreateProject && (
          <button 
            onClick={() => setShowCreateForm(true)}
            className="px-3 py-1 bg-teal-500 hover:bg-teal-600 text-white rounded-md text-sm flex items-center transition-colors"
          >
            <span className="mr-1">➕</span> Nouveau Projet
            {role === 'student' && (
              <span className="ml-1 text-xs bg-teal-400 px-1 rounded">(Étudiant)</span>
            )}
          </button>
        )}
      </div>
      
      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4">
          <p className="flex items-center">
            <span className="mr-2">❌</span> {error}
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center p-8">
          <svg className="animate-spin h-8 w-8 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <>
          {projects.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center text-gray-500">
              <p className="mb-4">Aucun projet trouvé.</p>
              {canCreateProject && (
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="px-4 py-2 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-md inline-flex items-center transition-colors"
                >
                  <span className="mr-2">✨</span> Créer mon premier projet
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => (
                <div key={project.id} onClick={() => onProjectSelect && onProjectSelect(project.id)}>
                  <ProjectCard 
                    project={project} 
                    role={role}
                    onDelete={handleProjectDeleted}
                    onUpdate={handleProjectUpdated}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Modal pour créer un projet */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {role === 'student' ? 'Créer un Projet Étudiant' : 'Créer un Nouveau Projet'}
                </h2>
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <ProjectForm onProjectCreated={handleProjectCreated} />
              
              <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                <button 
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectList;
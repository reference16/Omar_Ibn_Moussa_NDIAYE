import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/authContext';
import { deleteProject, updateProjectStatus, PROJECT_STATUS, PROJECT_STATUS_LABELS } from '../../services/projectServices';

const ProjectCard = ({ project, role, onDelete, onUpdate }) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Déterminer les permissions selon le rôle et la propriété du projet
  const isOwner = project.owner.id === user.id;
  const canDelete = isOwner || role === 'admin';
  const canChangeStatus = isOwner || role === 'admin';
  
  const handleViewDetails = () => {
    navigate(`/projects/${project.id}`);
  };
  
  const handleViewTasks = () => {
    navigate(`/projects/${project.id}/tasks`);
  };
  
  const handleDeleteProject = async () => {
    if (window.confirm('⚠️ Es-tu sûr de vouloir supprimer ce projet ?')) {
      try {
        await deleteProject(project.id);
        onDelete(project.id);
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        alert('Erreur lors de la suppression du projet');
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updatedProject = await updateProjectStatus(project.id, newStatus);
      if (onUpdate) {
        onUpdate(updatedProject);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };
  
  // Calculer le statut global du projet
  const calculateProgress = () => {
    if (!project.tasks || project.tasks.length === 0) {
      return 0;
    }
    
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(task => task.status === 'done').length;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  const progressPercent = calculateProgress();
  
  // Déterminer la couleur de la barre de progression
  const getProgressColor = () => {
    if (progressPercent >= 80) return 'bg-green-500';
    if (progressPercent >= 50) return 'bg-blue-500';
    if (progressPercent >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Obtenir la couleur du badge de statut
  const getStatusColor = () => {
    switch (project.status) {
      case PROJECT_STATUS.TODO:
        return 'bg-gray-100 text-gray-800';
      case PROJECT_STATUS.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case PROJECT_STATUS.DONE:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-md shadow-sm hover:shadow transition-shadow border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-800 truncate">{project.name}</h3>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
            {PROJECT_STATUS_LABELS[project.status]}
          </span>
        </div>
        {isOwner && (
          <span className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
            Propriétaire
          </span>
        )}
      </div>
      
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description || 'Aucune description'}</p>
        
        <div className="space-y-3 mb-4">
          {/* Barre de progression */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-600">Progression des tâches :</span>
              <span className="text-xs font-medium text-gray-700">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor()}`} 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          
          {/* Membres */}
          <div className="flex items-center text-gray-600 text-sm">
            <span className="mr-2">👥</span>
            <span>{project.members.length} membre{project.members.length > 1 ? 's' : ''}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleViewDetails}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm flex items-center transition-colors"
          >
            <span className="mr-1">👁️</span> Détails
          </button>
          
          <button
            onClick={handleViewTasks}
            className="px-3 py-1 bg-teal-100 hover:bg-teal-200 text-teal-700 rounded-md text-sm flex items-center transition-colors"
          >
            <span className="mr-1">📋</span> Tâches
          </button>
          
          {canChangeStatus && project.status === PROJECT_STATUS.TODO && (
            <button
              onClick={() => handleStatusChange(PROJECT_STATUS.IN_PROGRESS)}
              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm flex items-center transition-colors"
            >
              <span className="mr-1">▶️</span> Démarrer
            </button>
          )}
          
          {canChangeStatus && project.status === PROJECT_STATUS.IN_PROGRESS && (
            <button
              onClick={() => handleStatusChange(PROJECT_STATUS.DONE)}
              className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm flex items-center transition-colors"
            >
              <span className="mr-1">✅</span> Terminer
            </button>
          )}
          
          {canDelete && (
            <button
              onClick={handleDeleteProject}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm flex items-center transition-colors ml-auto"
            >
              <span className="mr-1">🗑️</span> Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
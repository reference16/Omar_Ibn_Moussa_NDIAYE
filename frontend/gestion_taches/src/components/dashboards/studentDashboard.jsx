import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/authContext';
import ProjectList from '../projects/projectList';
import { fetchTasks, fetchTaskStatistics } from '../../services/taskService';
import { PROJECT_STATUS_LABELS } from '../../services/projectServices';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [taskStats, setTaskStats] = useState({
    todo: 0,
    in_progress: 0,
    done: 0,
    urgent: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadTaskStats();
  }, [user, navigate]);
  
  const loadTaskStats = async (projectId = null) => {
    try {
      setLoading(true);
      const stats = await fetchTaskStatistics(projectId);
      setTaskStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProject(projectId);
    loadTaskStats(projectId);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  if (!user) {
    return null;
  }
  
  return (
    <div className="flex flex-col min-h-screen w-screen overflow-x-hidden bg-gray-100">
      {/* Header fixe */}
      <header className="w-full bg-teal-500 text-white shadow-md z-10">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold">FlowTask</h1>
            <span className="px-2 py-1 text-xs bg-teal-600 rounded-md">Étudiant</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => navigate('/profile')}
              className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded-md flex items-center transition-colors"
            >
              <span className="mr-1">👤</span> Profil
            </button>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-md flex items-center transition-colors"
            >
              <span className="mr-1">🚪</span> Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Main content avec largeur maximale et padding uniforme */}
      <main className="flex-grow w-full p-4">
        <div className="grid gap-4">
          {/* Carte de bienvenue */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Tableau de bord</h2>
            <p className="text-gray-600 mb-1">Bienvenue, {user.first_name} {user.last_name}</p>
            <p className="text-gray-600">Consultez vos tâches et projets en cours.</p>
          </div>
          
          {/* Statistiques des tâches */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📊</span> Mes Tâches
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-md p-4 border-l-4 border-blue-500">
                  <h3 className="text-gray-700 mb-1">À Faire</h3>
                  <p className="text-2xl font-bold text-blue-500">{taskStats.todo}</p>
                </div>
                
                <div className="bg-gray-50 rounded-md p-4 border-l-4 border-yellow-500">
                  <h3 className="text-gray-700 mb-1">En Cours</h3>
                  <p className="text-2xl font-bold text-yellow-500">{taskStats.in_progress}</p>
                </div>
                
                <div className="bg-gray-50 rounded-md p-4 border-l-4 border-green-500">
                  <h3 className="text-gray-700 mb-1">Terminées</h3>
                  <p className="text-2xl font-bold text-green-500">{taskStats.done}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Tâches urgentes */}
          {taskStats.urgent > 0 && (
            <div className="bg-white rounded-md shadow-sm p-5">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">🔥</span> Tâches Urgentes
              </h2>
              <div className="bg-red-50 rounded-md p-4 border border-red-100">
                <p className="text-red-600 font-semibold">
                  Vous avez {taskStats.urgent} tâche{taskStats.urgent > 1 ? 's' : ''} urgente{taskStats.urgent > 1 ? 's' : ''} à compléter !
                </p>
              </div>
            </div>
          )}
          
          {/* Projets */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📂</span> Mes Projets
            </h2>
            
            <div className="bg-gray-50 rounded-md p-4">
              <div className="flex flex-col space-y-2 mb-4">
                <div className="flex items-center text-yellow-500">
                  <span className="mr-2 text-xl">📁</span>
                  <h3 className="font-semibold">Mes Projets</h3>
                </div>
                <p className="text-sm text-gray-600 ml-7">
                  Note : Les projets "À faire" ne sont visibles que par leurs créateurs. Les projets deviennent visibles pour les membres une fois passés "En cours".
                </p>
              </div>
              
              <div className="pl-4 border-l-2 border-yellow-200">
                <ProjectList role="student" onProjectSelect={handleProjectSelect} />
              </div>
              
              <div className="mt-4 pl-8">
                <button 
                  className="flex items-center text-indigo-500 hover:text-indigo-600"
                  onClick={() => navigate('/projects/create')}
                >
                  <span className="mr-2">+</span>
                  <span>Nouveau Projet (Projet étudiant)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer simple */}
      <footer className="w-full bg-gray-800 text-white py-4 text-center">
        <p> 2025 FlowTask - Plateforme de gestion de tâches</p>
      </footer>
    </div>
  );
};

export default StudentDashboard;
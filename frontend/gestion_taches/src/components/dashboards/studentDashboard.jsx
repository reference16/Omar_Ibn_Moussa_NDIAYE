import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/authContext';
import ProjectList from '../projects/projectList';
import { fetchProjects, PROJECT_STATUS } from '../../services/projectServices';
import { fetchTaskStatistics } from '../../services/taskService';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    todo: 0,
    in_progress: 0,
    done: 0
  });
  const [taskStats, setTaskStats] = useState({
    todo: 0,
    in_progress: 0,
    done: 0,
    urgent: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Vérifier le rôle une seule fois au montage
    if (user.role !== 'student') {
      navigate('/teacher/dashboard');
      return;
    }

    loadStats();
  }, [user]); // Dépendance uniquement sur user

  const loadStats = async () => {
    try {
      setLoading(true);
      const [projects, stats] = await Promise.all([
        fetchProjects(),
        fetchTaskStatistics()
      ]);
      
      // Calculer des statistiques sur les projets
      const projectsStats = {
        total: projects.length,
        todo: projects.filter(p => p.status === PROJECT_STATUS.TODO).length,
        in_progress: projects.filter(p => p.status === PROJECT_STATUS.IN_PROGRESS).length,
        done: projects.filter(p => p.status === PROJECT_STATUS.DONE).length
      };
      
      setProjectStats(projectsStats);
      setTaskStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen w-screen overflow-hidden bg-gray-100">
      {/* Header */}
      <header className="bg-teal-500 text-white shadow-md w-full">
        <div className="w-full px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">FlowTask</h1>
              <span className="ml-2 px-2 py-1 text-xs bg-teal-600 rounded">Étudiant</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={goToProfile}
                className="px-3 py-1 bg-teal-600 hover:bg-teal-700 rounded text-sm mr-2"
              >
                Mon Profil
              </button>
              <button 
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded text-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full">
        <div className="w-full px-4 py-8">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-2">Tableau de bord Étudiant</h2>
            <p className="text-gray-600">Bienvenue, {user.first_name} {user.last_name}</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Project Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Statistiques des Projets</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">À faire</p>
                  <p className="text-2xl font-bold text-blue-600">{projectStats.todo}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-yellow-600">{projectStats.in_progress}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Terminés</p>
                  <p className="text-2xl font-bold text-green-600">{projectStats.done}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-purple-600">{projectStats.total}</p>
                </div>
              </div>
            </div>

            {/* Task Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Statistiques des Tâches</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">À faire</p>
                  <p className="text-2xl font-bold text-blue-600">{taskStats.todo}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">En cours</p>
                  <p className="text-2xl font-bold text-yellow-600">{taskStats.in_progress}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Terminées</p>
                  <p className="text-2xl font-bold text-green-600">{taskStats.done}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Urgentes</p>
                  <p className="text-2xl font-bold text-red-600">{taskStats.urgent}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Rapides */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Actions Rapides</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/projects/create')}
                className="bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded flex items-center justify-center transition-colors"
              >
                <span className="mr-2">➕</span>
                <span className="font-medium">Nouveau Projet</span>
              </button>
            </div>
          </div>

          {/* Projets */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Mes Projets</h3>
            <div className="bg-gray-50 p-4 rounded mb-4">
              <div className="flex items-center text-yellow-600 mb-2">
                <span className="mr-2">📝</span>
                <h4 className="font-medium">Note sur la visibilité</h4>
              </div>
              <p className="text-sm text-gray-600">
                Les projets "À faire" ne sont visibles que par leur créateur. Une fois passés "En cours", ils deviennent visibles pour tous les membres.
              </p>
            </div>
            <ProjectList onProjectsChange={loadStats} />
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

export default StudentDashboard;
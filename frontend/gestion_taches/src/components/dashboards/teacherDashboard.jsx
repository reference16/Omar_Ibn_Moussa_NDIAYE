import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/authContext';
import projectList from '../projects/projectList';
import { fetchProjects, PROJECT_STATUS } from '../../services/projectServices';
import { fetchTaskStatistics } from '../../services/taskService';

const TeacherDashboard = () => {
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
    if (user.role !== 'teacher') {
      navigate('/student/dashboard');
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

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen w-screen overflow-x-hidden bg-gray-100">
      {/* Header fixe */}
      <header className="bg-white shadow-sm py-4 px-6 fixed top-0 w-full z-10">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-800">Gestion des Tâches</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main content avec largeur maximale et padding uniforme */}
      <main className="flex-grow w-full p-4 mt-16">
        <div className="grid gap-4">
          {/* Carte de bienvenue */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Tableau de bord Enseignant</h2>
            <p className="text-gray-600 mb-1">Bienvenue, {user.first_name} {user.last_name}</p>
            <p className="text-gray-600">Gérez vos projets et suivez la progression de vos étudiants.</p>
          </div>
          
          {/* Statistiques des projets */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📊</span> Statistiques des Projets
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-md p-4 border-l-4 border-teal-500">
                  <h3 className="text-gray-700 mb-1">Total Projets</h3>
                  <p className="text-2xl font-bold text-teal-500">{projectStats.total}</p>
                </div>
                
                <div className="bg-gray-50 rounded-md p-4 border-l-4 border-blue-500">
                  <h3 className="text-gray-700 mb-1">À Faire</h3>
                  <p className="text-2xl font-bold text-blue-500">{projectStats.todo}</p>
                </div>
                
                <div className="bg-gray-50 rounded-md p-4 border-l-4 border-yellow-500">
                  <h3 className="text-gray-700 mb-1">En Cours</h3>
                  <p className="text-2xl font-bold text-yellow-500">{projectStats.in_progress}</p>
                </div>
                
                <div className="bg-gray-50 rounded-md p-4 border-l-4 border-green-500">
                  <h3 className="text-gray-700 mb-1">Terminés</h3>
                  <p className="text-2xl font-bold text-green-500">{projectStats.done}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Statistiques des tâches */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📋</span> Statistiques des Tâches
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-4">
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
                
                <div className="bg-gray-50 rounded-md p-4 border-l-4 border-red-500">
                  <h3 className="text-gray-700 mb-1">Urgentes</h3>
                  <p className="text-2xl font-bold text-red-500">{taskStats.urgent}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions rapides */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">⚡</span> Actions Rapides
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/projects/create')}
                className="bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-md flex items-center justify-center transition-colors"
              >
                <span className="mr-2 text-xl">➕</span>
                <span className="font-medium">Nouveau Projet</span>
              </button>
              
              <button 
                onClick={() => navigate('/tasks/review')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 px-4 rounded-md flex items-center justify-center transition-colors"
              >
                <span className="mr-2 text-xl">✅</span>
                <span className="font-medium">Tâches à Vérifier</span>
              </button>
            </div>
          </div>
          
          {/* Projets */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📂</span> Projets
            </h2>
            
            <div className="bg-gray-50 rounded-md p-4">
              <projectList onProjectsChange={loadStats} />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer simple */}
      <footer className="bg-white shadow-sm py-4 px-6 mt-auto">
        <p className="text-center text-gray-600 text-sm">
          2025 Gestion des Tâches. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
};

export default TeacherDashboard;
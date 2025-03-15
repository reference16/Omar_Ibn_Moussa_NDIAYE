import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/authContext';
import ProjectList from '../projects/projectList';
import { fetchProjects } from '../../services/projectServices';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [projectStats, setProjectStats] = useState({
    total: 0,
    active: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Vérifier que l'utilisateur est un professeur
    if (!user.is_teacher && !user.is_staff) {
      navigate('/dashboard');
    }
    
    loadProjectStats();
  }, [user, navigate]);
  
  const loadProjectStats = async () => {
    try {
      setLoading(true);
      const projects = await fetchProjects();
      
      // Calculer des statistiques sur les projets
      const active = projects.filter(p => p.tasks?.some(t => t.status !== 'done')).length;
      const completed = projects.filter(p => p.tasks?.every(t => t.status === 'done')).length;
      
      setProjectStats({
        total: projects.length,
        active,
        completed
      });
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
      <header className="w-full bg-teal-500 text-white shadow-md z-10">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold">FlowTask</h1>
            <span className="px-2 py-1 text-xs bg-teal-600 rounded-md">Enseignant</span>
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">Tableau de bord Enseignant</h2>
            <p className="text-gray-600 mb-1">Bienvenue, {user.first_name} {user.last_name}</p>
            <p className="text-gray-600">Gérez vos projets et suivez la progression de vos étudiants.</p>
          </div>
          
          {/* Statistiques */}
          <div className="bg-white rounded-md shadow-sm p-5">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="mr-2">📊</span> Mes Statistiques
            </h2>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-md p-4 border-l-4 border-teal-500">
                  <h3 className="text-gray-700 mb-1">Total Projets</h3>
                  <p className="text-2xl font-bold text-teal-500">{projectStats.total}</p>
                </div>
                
                <div className="bg-gray-50 rounded-md p-4 border-l-4 border-blue-500">
                  <h3 className="text-gray-700 mb-1">Projets Actifs</h3>
                  <p className="text-2xl font-bold text-blue-500">{projectStats.active}</p>
                </div>
                
                <div className="bg-gray-50 rounded-md p-4 border-l-4 border-green-500">
                  <h3 className="text-gray-700 mb-1">Projets Terminés</h3>
                  <p className="text-2xl font-bold text-green-500">{projectStats.completed}</p>
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
              <span className="mr-2">📂</span> Mes Projets
            </h2>
            
            <div className="bg-gray-50 rounded-md p-4">
              <ProjectList role="teacher" />
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer simple */}
      <footer className="w-full bg-gray-800 text-white py-4 text-center">
        <p>© 2025 FlowTask - Plateforme de gestion de tâches</p>
      </footer>
    </div>
  );
};

export default TeacherDashboard;
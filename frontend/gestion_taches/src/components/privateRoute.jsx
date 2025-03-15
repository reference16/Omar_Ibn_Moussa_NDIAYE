import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/authContext';

/**
 * PrivateRoute - Composant qui protège les routes nécessitant une authentification
 * et contrôle l'accès basé sur les rôles.
 * 
 * @param {React.Component} element - Le composant à afficher si l'utilisateur est authentifié et autorisé
 * @param {Array} allowedRoles - Tableau des rôles autorisés à accéder à cette route
 * @returns {JSX.Element} Le composant si l'accès est autorisé, sinon redirection
 */
const PrivateRoute = ({ element, allowedRoles = [] }) => {
  const { user } = useContext(AuthContext);

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Déterminer le rôle de l'utilisateur
  const userRole = user.role || (user.is_superuser ? 'admin' : user.is_staff ? 'teacher' : 'student');

  // Si des rôles sont spécifiés, vérifier que l'utilisateur a le bon rôle
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Rediriger vers le dashboard approprié selon le rôle
    switch (userRole) {
      case 'admin':
        return <Navigate to="/admin/dashboard" replace />;
      case 'teacher':
        return <Navigate to="/teacher/dashboard" replace />;
      case 'student':
        return <Navigate to="/student/dashboard" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  // Si l'utilisateur est authentifié et a les bons rôles, afficher le composant
  return element;
};

export default PrivateRoute;
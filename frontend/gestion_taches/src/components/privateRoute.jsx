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
  const { user, loading } = useContext(AuthContext);

  // Si l'authentification est en cours de chargement, afficher un indicateur
  if (loading) {
    return <div className="loading-container">Chargement...</div>;
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si des rôles sont spécifiés, vérifier que l'utilisateur a le bon rôle
  if (allowedRoles && allowedRoles.length > 0) {
    const hasAllowedRole = checkUserRole(user, allowedRoles);
    
    if (!hasAllowedRole) {
      // Rediriger vers le dashboard approprié si l'utilisateur n'a pas le bon rôle
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Si l'utilisateur est authentifié et a les bons rôles, afficher le composant
  return element;
};

/**
 * Vérifie si l'utilisateur a l'un des rôles autorisés
 * 
 * @param {Object} user - L'utilisateur courant
 * @param {Array} allowedRoles - Tableau des rôles autorisés
 * @returns {boolean} Vrai si l'utilisateur a un rôle autorisé
 */
const checkUserRole = (user, allowedRoles) => {
  if (allowedRoles.includes('admin') && (user.is_superuser || user.is_staff)) {
    return true;
  }
  
  if (allowedRoles.includes('teacher') && user.is_teacher) {
    return true;
  }
  
  if (allowedRoles.includes('student') && !user.is_superuser && !user.is_staff && !user.is_teacher) {
    return true;
  }
  
  return false;
};

export default PrivateRoute;
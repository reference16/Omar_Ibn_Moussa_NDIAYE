from rest_framework import permissions

class IsAdminOrAuthenticatedStudent(permissions.BasePermission):
    """
    Permission personnalisée pour gérer l'accès aux vues utilisateur.
    - Les étudiants authentifiés peuvent accéder à leur profil et voir les autres étudiants
    - Les administrateurs ont accès à tout
    - L'inscription des étudiants est publique
    """
    def has_permission(self, request, view):
        # Permettre l'inscription des étudiants
        if view.action == 'register_student':
            return True
            
        # Vérifier si l'utilisateur est authentifié
        if not bool(request.user and request.user.is_authenticated):
            return False

        # Permettre l'accès au profil personnel
        if view.action == 'me':
            return True
            
        # Permettre aux étudiants authentifiés de lister les autres étudiants
        if view.action in ['list', 'students'] and request.method == 'GET':
            return True
            
        # Pour toutes les autres actions, l'utilisateur doit être admin
        return bool(request.user.is_staff)

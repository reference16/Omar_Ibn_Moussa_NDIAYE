from rest_framework import permissions

class IsProjectOwnerOrMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Le propriétaire a toujours tous les droits
        if request.user == obj.owner:
            return True
            
        # Pour les projets "à faire", seul le propriétaire peut voir/modifier
        if obj.status == 'todo':
            return False
            
        # Pour les projets "en cours", les membres peuvent voir
        if request.method in permissions.SAFE_METHODS:
            return request.user in obj.members.all()
            
        # Modification/Suppression uniquement pour le propriétaire
        return False

def check_is_project_owner(user, project):
    """
    Vérifie si l'utilisateur est le propriétaire du projet
    """
    return user == project.owner
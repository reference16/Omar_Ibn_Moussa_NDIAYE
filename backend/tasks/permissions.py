from rest_framework import permissions

class IsProjectOwnerorReadOnly(permissions.BasePermission):
    #permission qui permet d'acceder a une tache seulement si l'utilisateur est le proprietaire de la tache ou si l'utilisateur est un admin
    def has_object_permission(self, request, view, obj):
        #autoriser la lecture seul pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        #autoriser l'ecrire seulement pour l'utilisateur proprietaire ou si l'utilisateur est un admin
        return obj.project.owner == request.user or request.user.is_superuser

class IsTaskAssignedorReadOnly(permissions.BasePermission):
    #permission qui permet à l'utilisateur assigné à une tache de la modifier les autres utilisateurs peuvent la lire seulement
    def has_object_permission(self, request, view, obj):
        #autoriser la lecture seulement pour tous
        if request.method in permissions.SAFE_METHODS:
            return True
        #Autoriser la modification uniquement pour l'utilisateur assigné à la tache
        return obj.assigned_to == request.user or obj.project.owner == request.user or request.user.is_superuser
   
from rest_framework import permissions

class IsProjectOwnerOrMember(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Lecture autorisée pour les membres et le propriétaire
        if request.method in permissions.SAFE_METHODS:
            return request.user == obj.owner or request.user in obj.members.all()
        # Modification/Suppression uniquement pour le propriétaire
        return request.user == obj.owner
from rest_framework import serializers
from .models import Project
from users.serializers import UserSerializer
from users.models import CustomUser
from .permissions import check_is_project_owner

class ProjectSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)
    members_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = ['id', 'name', 'description', 'status', 'owner', 'members', 'members_ids', 'is_owner', 'created_at', 'updated_at']
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return check_is_project_owner(request.user, obj)
        return False

    def create(self, validated_data):
        members_ids = validated_data.pop('members_ids', [])
        project = super().create(validated_data)
        
        # Toujours ajouter le propriétaire comme membre
        project.members.add(project.owner)
        
        # Ajouter les autres membres spécifiés
        if members_ids:
            members = CustomUser.objects.filter(id__in=members_ids)
            project.members.add(*members)
        
        return project

    def update(self, instance, validated_data):
        members_ids = validated_data.pop('members_ids', None)
        old_status = instance.status
        project = super().update(instance, validated_data)
        
        # Si members_ids est fourni, mettre à jour les membres
        if members_ids is not None:
            project.members.clear()
            project.members.add(project.owner)  # S'assurer que le propriétaire reste membre
            members = CustomUser.objects.filter(id__in=members_ids)
            project.members.add(*members)
        
        # Si le projet passe de 'todo' à 'in_progress', les membres peuvent maintenant le voir
        # La visibilité est gérée dans la vue API par le queryset
        
        return project
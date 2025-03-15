from rest_framework import serializers
from .models import Project
from users.serializers import UserSerializer
from users.models import CustomUser

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
        fields = ['id', 'name', 'description', 'owner', 'members', 'members_ids', 'is_owner', 'created_at', 'updated_at']
        read_only_fields = ['owner', 'created_at', 'updated_at']

    def get_is_owner(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            return obj.owner == request.user
        return False

    def create(self, validated_data):
        members_ids = validated_data.pop('members_ids', [])
        
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            validated_data['owner'] = request.user
            
        project = super().create(validated_data)
        
        # Ajouter le propriétaire comme membre
        project.members.add(request.user)
        
        # Ajouter les membres sélectionnés
        if members_ids:
            for member_id in members_ids:
                try:
                    user = CustomUser.objects.get(id=member_id)
                    project.members.add(user)
                except CustomUser.DoesNotExist:
                    pass
                    
        return project
        
    def update(self, instance, validated_data):
        members_ids = validated_data.pop('members_ids', None)
        
        # Mettre à jour les champs standard
        instance = super().update(instance, validated_data)
        
        # Si des membres ont été fournis, mettre à jour la relation
        if members_ids is not None:
            # Vider tous les membres actuels (sauf le propriétaire)
            current_members = instance.members.all()
            for member in current_members:
                if member != instance.owner:
                    instance.members.remove(member)
            
            # S'assurer que le propriétaire est toujours membre
            instance.members.add(instance.owner)
            
            # Ajouter les nouveaux membres
            for member_id in members_ids:
                try:
                    user = CustomUser.objects.get(id=member_id)
                    instance.members.add(user)
                except CustomUser.DoesNotExist:
                    pass
                    
        return instance
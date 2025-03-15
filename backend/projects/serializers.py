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
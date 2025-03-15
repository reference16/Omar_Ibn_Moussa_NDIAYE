from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'password2', 'first_name', 'last_name', 'role', 'is_staff', 'is_superuser']
        read_only_fields = ['id', 'is_staff', 'is_superuser']

    def get_role(self, obj):
        if obj.is_superuser:
            return 'admin'
        elif obj.is_staff:
            return 'teacher'
        return 'student'

    def validate(self, attrs):
        if attrs.get('password') != attrs.get('password2'):
            raise serializers.ValidationError({"password": "Les mots de passe ne correspondent pas"})
        return attrs
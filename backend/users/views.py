from django.shortcuts import render
from django.contrib.auth import get_user_model
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import UserSerializer
from .permissions import IsAdminOrAuthenticatedStudent
from django.db import transaction

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAdminOrAuthenticatedStudent]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return User.objects.all()
        # Les étudiants ne peuvent voir que les autres étudiants
        return User.objects.filter(is_staff=False, is_superuser=False)

    def _create_user_from_serializer(self, serializer, is_staff=False, is_superuser=False):
        try:
            with transaction.atomic():
                password = serializer.validated_data.pop('password')
                serializer.validated_data.pop('password2')
                if 'role' in serializer.validated_data:
                    serializer.validated_data.pop('role')
                
                user = User.objects.create_user(
                    **serializer.validated_data,
                    is_staff=is_staff,
                    is_superuser=is_superuser
                )
                user.set_password(password)
                user.save()
                
                return Response(
                    UserSerializer(user).data,
                    status=status.HTTP_201_CREATED
                )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def create_teacher(self, request):
        if not request.user.is_superuser:
            return Response(
                {"error": "Seul un administrateur peut créer un compte enseignant"},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            return self._create_user_from_serializer(serializer, is_staff=True)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def register_student(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            return self._create_user_from_serializer(serializer)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get'])
    def students(self, request):
        """
        Liste tous les étudiants (non staff et non superuser)
        """
        students = User.objects.filter(is_staff=False, is_superuser=False)
        serializer = self.get_serializer(students, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'patch', 'delete'])
    def me(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        
        elif request.method == 'PATCH':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            request.user.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
from django import forms
from django.contrib.auth import get_user_model

User = get_user_model()

class UserProfileForm(forms.ModelForm):
    avatar = forms.ImageField(
        required=False,
        widget=forms.FileInput(
            attrs={
                'class': 'form-control',
                'accept': 'image/*'
            }
        ),
        label="Photo de profil"
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'avatar']
        labels = {
            'username': "Nom d'utilisateur",
            'email': 'Adresse email',
            'first_name': 'Prénom',
            'last_name': 'Nom',
        }
        widgets = {
            'username': forms.TextInput(attrs={'class': 'form-control'}),
            'email': forms.EmailInput(attrs={'class': 'form-control'}),
            'first_name': forms.TextInput(attrs={'class': 'form-control'}),
            'last_name': forms.TextInput(attrs={'class': 'form-control'}),
            'avatar': forms.FileInput(attrs={'class': 'form-control', 'accept': 'image/*'})
        }

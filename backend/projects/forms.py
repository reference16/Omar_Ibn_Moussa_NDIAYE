from django import forms
from .models import Project

class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ['name', 'description', 'members']
        labels = {
            'name': 'Nom du projet',
            'description': 'Description',
            'members': 'Membres'
        }
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'members': forms.SelectMultiple(attrs={'class': 'form-control'})
        }

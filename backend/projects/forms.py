from django import forms
from .models import Project

class ProjectForm(forms.ModelForm):
    class Meta:
        model = Project
        fields = ['name', 'description', 'members', 'status']
        labels = {
            'name': 'Nom du projet',
            'description': 'Description',
            'members': 'Membres',
            'status': 'État'
        }
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'description': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
            'members': forms.SelectMultiple(attrs={'class': 'form-control'}),
            'status': forms.Select(attrs={'class': 'form-control'})
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        instance = kwargs.get('instance')

        # Pour un nouveau projet, masquer le champ status
        if not instance:
            self.fields['status'].widget = forms.HiddenInput()
            self.fields['status'].initial = 'todo'

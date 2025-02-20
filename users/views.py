from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import UserProfileForm
from django.contrib.auth import get_user_model
import os

User = get_user_model()

# Create your views here.

@login_required
def profile_view(request):
    return render(request, 'users/profile.html', {'user': request.user})

@login_required
def profile_edit(request):
    if request.method == 'POST':
        form = UserProfileForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            # Gérer l'upload de l'avatar
            if 'avatar' in request.FILES:
                # Si un ancien avatar existe, le supprimer
                if request.user.avatar:
                    try:
                        if os.path.exists(request.user.avatar.path):
                            os.remove(request.user.avatar.path)
                    except Exception as e:
                        print(f"Erreur lors de la suppression de l'ancien avatar: {e}")
            
            user = form.save()
            messages.success(request, 'Votre profil a été mis à jour avec succès!')
            return redirect('users:profile')
        else:
            messages.error(request, 'Il y a des erreurs dans le formulaire.')
    else:
        form = UserProfileForm(instance=request.user)
    
    return render(request, 'users/profile_edit.html', {
        'form': form,
        'user': request.user
    })
from django import forms
from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import CustomUser

# class CustomUserChangeForm(UserChangeForm):
#     email = forms.EmailField(required=True)

#     class Meta:
#         model = CustomUser
#         fields = ('email', 'first_name', 'last_name')


class UploadAvatarForm(forms.Form):
    avatar = forms.FileField()



# from django import forms

# from allauth.account.forms import LoginForm

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ('email',)


class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = UserChangeForm.Meta.fields

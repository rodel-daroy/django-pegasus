from allauth.account.forms import SignupForm
from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import ugettext_lazy as _

from apps.teams.util import get_next_unique_team_slug
from .models import Team, Invitation


class TeamSignupForm(SignupForm):
    invitation_id = forms.CharField(widget=forms.HiddenInput(), required=False)
    full_name = forms.CharField(
        label=_("Full name"),
        max_length=100,
        widget=forms.TextInput(attrs={'placeholder': _('Full name')}),
        required=False,
    )
    phone_number = forms.CharField(
        label=_("Phone Number"),
        max_length=15,
        widget=forms.TextInput(attrs={'placeholder': _('Phone Number')}),
        required=False,
    )
    company_name = forms.CharField(
        label=_("Company Name"),
        max_length=100,
        widget=forms.TextInput(attrs={'placeholder': _('Company Name')}),
        required=False,
    )
    mailsaas_type = forms.CharField(
        label=_("User Type"),
        max_length=100,
        widget=forms.TextInput(attrs={'placeholder': _('User Type')}),
        required=False,
    )
    
    def clean_team_name(self):
        full_name = self.cleaned_data['full_name']
        phone_number = self.cleaned_data['phone_number']
        company_name = self.cleaned_data['company_name']
        mailsaas_type = self.cleaned_data['mailsaas_type']
        invitation_id = self.cleaned_data.get('invitation_id')
        # if invitation is not set then team name is required
        if not invitation_id and not full_name:
            raise forms.ValidationError(_('Full Name is required!'))
        if not invitation_id and not phone_number:
             raise forms.ValidationError(_('Phone Number is required!'))
        if not invitation_id and not company_name:
             raise forms.ValidationError(_('Company Name is required!'))
        if not invitation_id and not mailsaas_type:
             raise forms.ValidationError(_('User Type is required!'))
        
        return full_name

    def clean_invitation_id(self):
        invitation_id = self.cleaned_data.get('invitation_id')
        if invitation_id:
            try:
                invite = Invitation.objects.get(id=invitation_id)
                if invite.is_accepted:
                    raise forms.ValidationError(_(
                        'It looks like that invitation link has expired. '
                        'Please request a new invitation or sign in to continue.'
                    ))
            except (Invitation.DoesNotExist, ValidationError):
                # ValidationError is raised if the ID isn't a valid UUID, which should be treated the same
                # as not found
                raise forms.ValidationError(_(
                    'That invitation could not be found. '
                    'Please double check your invitation link or sign in to continue.'
                ))
        return invitation_id

    def save(self, request):
        invitation_id = self.cleaned_data['invitation_id']
        full_name = self.cleaned_data['full_name']
        phone_number = self.cleaned_data['phone_number']
        company_name = self.cleaned_data['company_name']
        mailsaas_type = self.cleaned_data['mailsaas_type']

        print("reqqqqqqqq ",request, full_name)
        user = super().save(request)
        user.full_name = full_name
        user.phone_number = phone_number
        user.company_name = company_name
        user.mailsaas_type = mailsaas_type
        user.save(update_fields=['full_name', 'phone_number', 'company_name', 'mailsaas_type'])
        print("userrrrr ", user)

        if invitation_id:
            assert not full_name
        else:
            slug = get_next_unique_team_slug(full_name)
            team = Team.objects.create(name=full_name, slug=slug)
            team.members.add(user, through_defaults={'role': 'admin'})
            team.save()
        return user


class TeamChangeForm(forms.ModelForm):

    class Meta:
        model = Team
        fields = ('name', 'slug')
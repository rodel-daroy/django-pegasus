from django import forms
from .models import Campaign



class CreateCampaignForm(forms.ModelForm):
    
    class Meta:
        model = Campaign
        fields = ('title', 'fromAddress')
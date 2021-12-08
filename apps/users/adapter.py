from allauth.account.adapter import DefaultAccountAdapter


class CustomUserAccountAdapter(DefaultAccountAdapter):

    def save_user(self, request, user, form, commit=True):
        """
        Saves a new `User` instance using information provided in the
        signup form.
        """
        from allauth.account.utils import user_field

        user = super().save_user(request, user, form, False)
        user_field(user, 'email', request.data.get('email', ''))
        user_field(user, 'full_name', request.data.get('full_name', ''))
        user_field(user, 'phone_number', request.data.get('phone_number', ''))
        user_field(user, 'company_name', request.data.get('company_name', ''))
        user_field(user, 'mailsaas_type', request.data.get('mailsaas_type', ''))
        user.save()
        return user

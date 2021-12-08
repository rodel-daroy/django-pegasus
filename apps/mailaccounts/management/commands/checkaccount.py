from django.core.management.base import BaseCommand, CommandError
from apps.mailaccounts.models import EmailAccount
from apps.users.models import CustomUser

class Command(BaseCommand):
    help = 'Promotes the given user to a superuser and provides admin access.'

    def add_arguments(self, parser):
        parser.add_argument('username', type=str)

    def handle(self, username, **options):
        # try:
        emails = EmailAccount.objects.all()
        for email in emails:
            email.has_error = False
            email.save()
        #     user = EmailAccount.objects.get(email=username)
        #     # print(user.has_error)
        #     print(user.error_was_notified)
        # user = CustomUser.objects.get(email="scott@dealboostmedia.com")
        # except:
        #     print("Does not exist")
        # except CustomUser.DoesNotExist:
        #     raise CommandError('No user with username/email {} found!'.format(username))
        # user.admin = True
        # user.save()
        # print('{} successfully promoted to superuser and can now access the admin site'.format(username))

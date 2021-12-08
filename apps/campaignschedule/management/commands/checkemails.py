from django.core.management.base import BaseCommand, CommandError
from apps.campaignschedule.models import EmailSchedule


class Command(BaseCommand):
    help = 'Promotes the given user to a superuser and provides admin access.'


    def handle(self,**options):
        try:
            emails = EmailSchedule.objects.all()
            for email in emails:
                print(email.mailaccount)
                print(email.time)
                print(email.date)
            # user = EmailAccount.objects.get(email=username)
            # print(user.has_error)

        except:
            print("Does not exist")
        # except CustomUser.DoesNotExist:
        #     raise CommandError('No user with username/email {} found!'.format(username))
        # user.admin = True
        # user.save()
        # print('{} successfully promoted to superuser and can now access the admin site'.format(username))

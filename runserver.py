import os

os.system("python manage.py makemigrations mailaccounts")
os.system("python manage.py makemigrations campaign")
os.system("python manage.py makemigrations campaignschedule")
os.system("python manage.py makemigrations pegasus")
os.system("python manage.py makemigrations teams")
os.system("python manage.py makemigrations integration") 
os.system("python manage.py makemigrations subscriptions")
os.system("python manage.py makemigrations users")
os.system("python manage.py makemigrations web")
os.system("python manage.py makemigrations unsubscribes")

os.system("python manage.py migrate")

os.system("python manage.py runserver")

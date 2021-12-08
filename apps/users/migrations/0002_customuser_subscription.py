
# Generated by Django 3.1.6 on 2021-05-05 13:49
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('djstripe', '0007_2_4'),
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='subscription',
            field=models.ForeignKey(blank=True, help_text="The user's Stripe Subscription object, if it exists", null=True, on_delete=django.db.models.deletion.SET_NULL, to='djstripe.subscription'),
        ),
    ]

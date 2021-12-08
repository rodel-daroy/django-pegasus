from django.conf import settings
from storages.backends.s3boto3 import S3Boto3Storage

class PrivateMediaStorage(S3Boto3Storage):
    def __init__(self, *args, **kwargs):
        kwargs['bucket_name'] = settings.AWS_PRIVATE_BUCKET
        super(PrivateMediaStorage, self).__init__(*args, **kwargs)
    location = ''
    default_acl = 'private'
    file_overwrite = False
    custom_domain = False
import os
import uuid
from django.utils.deconstruct import deconstructible
from rest_framework.pagination import PageNumberPagination


@deconstructible
class RandomFileName(object):
    def __init__(self, path):
        self.path = os.path.join(path, "%s%s")

    def __call__(self, _, filename):
        # NOTE It's up to the validators to check if it's the correct file
        # type in name or if one even exist.
        extension = os.path.splitext(filename)[1]
        return self.path % (uuid.uuid4(), extension)


class CustomPageNumberPagination(PageNumberPagination):
    page_size_query_param = "size"  # items per page

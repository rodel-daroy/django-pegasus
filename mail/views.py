from django.shortcuts import render
from django.http import HttpResponseRedirect


def handler404(request, exception):
    data = {}
    return render(request, '404.html', data)


def handler500(request, *args, **argv):
    data = {}
    return render(request, '500.html', data)

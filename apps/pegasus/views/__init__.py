from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.generic import TemplateView


@method_decorator(login_required, name='dispatch')
class ExamplesHomeView(TemplateView):
    template_name = 'pegasus/examples_home.html'

    def get_context_data(self, **kwargs):
        return {
            'active_tab': 'home',
        }


# import other views
from .objects import *
from .payments import *
from .tasks import *

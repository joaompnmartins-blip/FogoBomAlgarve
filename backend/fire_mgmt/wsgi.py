# backend/fire_mgmt/wsgi.py
import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'fire_mgmt.settings')

application = get_wsgi_application()

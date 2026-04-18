from django.urls import path
from .views import google_login, profile

urlpatterns = [
    path("google/", google_login),
    path("profile/", profile),
]

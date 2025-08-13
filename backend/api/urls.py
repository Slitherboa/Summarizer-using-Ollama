from django.urls import path
from . import views

urlpatterns = [
    path('upload', views.upload_view, name='upload'),
    path('ask', views.ask_view, name='ask'),
]

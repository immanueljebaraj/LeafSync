from django.urls import path
from .views import ask_groq

urlpatterns = [
    path('ask-groq/', ask_groq, name='ask_groq'),
]
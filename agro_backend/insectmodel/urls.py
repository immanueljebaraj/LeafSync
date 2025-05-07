from django.urls import path
from .views import predict_insect

urlpatterns = [
    path('predict/', predict_insect, name='predict_insect'),
]
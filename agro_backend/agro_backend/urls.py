from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('auth_api.urls')),
    path('api/insect/', include('insectmodel.urls')),
    path('api/plant/', include('plant_disease_detection.urls')),
    path('api/groq/', include('chatbot.urls')),
]
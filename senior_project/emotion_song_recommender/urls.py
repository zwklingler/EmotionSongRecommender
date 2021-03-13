from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='emotion_song_recommender_home'),
    path('get_emotion_songs/', views.get_emotion_songs, name="emotion_song_recommender_get_emotion"),

]
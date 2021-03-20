# Django
from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.conf.urls.static import static
import logging
from django.views.decorators.csrf import csrf_exempt
import urllib.request

# Image Recognition
from tensorflow.keras.models import load_model
import tensorflow.keras.backend as backend
from tensorflow.keras.preprocessing import image
import numpy as np
import face_recognition
from cv2 import cv2

# Spotify API
import yaml
import time
from urllib.parse import urlencode
import requests
import datetime
import base64
import json
import numpy as np
from .spotifyAPI import spotifyAPI

def home(request):
    return render(request, 'emotion_song_recommender/index.html')

@csrf_exempt 
def search(request):
    if request.method == 'POST':
        data = {}

        song_data = ''
        artist_data = ''
        genre_data = ''
        data = {}


        try:
            search_by = request.POST.get('search_by')
            search_text = request.POST.get('search_text')
            data = {}
            if (search_text != None and search_by != None):
                if (search_by == 'song'):
                    song_data = search_songs(request, search_text)
                    data = {
                        'songs': song_data,
                    }
                elif (search_by == 'artist'):
                    artist_data = search_artists(request, search_text)
                    data = {
                        'artists': artist_data,
                    }
                else:
                    genres = search_genres(request)
                    genre_data = []
                    for genre in genres['genres']:
                        if (search_text.lower() in genre):
                            genre_data.append(genre)
                    data = {
                        'genres': genre_data
                    }

               
            else:
                data = {
                    'error': 'Enter data to search.'
                }        
        except:
            data = {
                'error': 'An Error Occurred. Try again.'
            }
        if bool(data) == False:
            data = {
                'error': 'No results were found. Try again.'
            }
        
        return JsonResponse(data)

@csrf_exempt 
def get_emotion_songs(request):
    if request.method == 'POST':

        data = {}
        popularity = request.POST.get('popularity')

        genres = json.loads(request.POST.get('genres'))
        songs = json.loads(request.POST.get('songs'))
        artists = json.loads(request.POST.get('artists'))
        

        image = _grab_image(stream=request.FILES["file"])
        while image.shape[0] > 500 and image.shape[1] > 500:
            image = cv2.resize(image, (image.shape[0] // 2, image.shape[1] // 2))

        face_locations = face_recognition.face_locations(image)
        if (len(face_locations) < 1):
            data = {
                'error': 'No face was found in the image',
            }
        else:
            try:
                top, right, bottom, left = face_locations[0]
                face_image = image[top:bottom, left:right]
                gray_image = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)

                image = cv2.resize(gray_image, (48,48))

                image = image.reshape(1, 48, 48, 1)


                model = load_model('model.h5')

                predictions = model.predict(image)

                max_index = np.argmax(predictions)

                emotion_detection = ('angry', 'happy', 'sad', 'neutral')
                emotion_prediction = emotion_detection[max_index] 
                
                song_data = get_songs(request, emotion_prediction, popularity, genres, songs, artists)
                
                data = {
                    'songs': song_data,
                    'emotion': emotion_prediction
                }
                '''
                data = {
                    'emotion': emotion_prediction,
                }
                '''
            except:
                data = {
                    'error': 'An error occurred, try again',
                }
        return JsonResponse(data)

def _grab_image(path=None, stream=None, url=None):
	# if the path is not None, then load the image from disk
	if path is not None:
		image = cv2.imread(path)
	# otherwise, the image does not reside on disk
	else:	
		# if the URL is not None, then download the image
		if url is not None:
			resp = urllib.request.urlopen(url)
			data = resp.read()
		# if the stream is not None, then the image has been uploaded
		elif stream is not None:
			data = stream.read()
		# convert the image to a NumPy array and then read it into
		# OpenCV format
		image = np.asarray(bytearray(data), dtype="uint8")
		image = cv2.imdecode(image, cv2.IMREAD_COLOR)
 
	# return the image
	return image

def get_parameters(emotion):
    valence = 0
    tempo = 0
    energy = 0

    if emotion == 'happy':
        max_valence = 1.0
        min_valence = 0.8
        min_tempo = 100
        max_tempo = 120
        max_energy = 1.0
        min_energy = 0.8

        valence = np.random.uniform(min_valence, max_valence)
        tempo = np.random.uniform(min_tempo, max_tempo)
        energy = np.random.uniform(min_energy, max_energy)

    if emotion == 'sad':
        max_valence = 0.2
        min_valence = 0.0
        min_tempo = 60
        max_tempo = 80
        max_energy = 0.2
        min_energy = 0.0

        valence = np.random.uniform(min_valence, max_valence)
        tempo = np.random.uniform(min_tempo, max_tempo)
        energy = np.random.uniform(min_energy, max_energy)

    if emotion == 'angry':
        max_valence = 0.2
        min_valence = 0.0
        min_tempo = 130
        max_tempo = 150
        max_energy = 1.0
        min_energy = 0.8

        valence = np.random.uniform(min_valence, max_valence)
        tempo = np.random.uniform(min_tempo, max_tempo)
        energy = np.random.uniform(min_energy, max_energy)

    if emotion == 'neutral':
        max_valence = 0.6
        min_valence = 0.4
        min_tempo = 80
        max_tempo = 100
        max_energy = 0.6
        min_energy = 0.4

        valence = np.random.uniform(min_valence, max_valence)
        tempo = np.random.uniform(min_tempo, max_tempo)
        energy = np.random.uniform(min_energy, max_energy)

    return valence, tempo, energy

def get_spotify_connection(request):
# load yml file with hidden variables into dictionary

    constants_file = './constants.yml'
    constants = yaml.load(open(constants_file), Loader=yaml.Loader)

    spotify_id = constants['database']['client_id']
    spotify_secret = constants['database']['client_secret']

    spotify = spotifyAPI(spotify_id, spotify_secret)
    if 'token_expiration' in request.session:
        spotify.access_token_expires = datetime.datetime.fromtimestamp(int(request.session['token_expiration']))
    if 'token' in request.session:
        spotify.access_token = str(request.session['token'])

    if spotify.access_token_did_expire == None or spotify.access_token_did_expire == True:
        print(spotify.perform_auth())
        print(spotify.access_token_expires)
        request.session['token_expiration'] = str(spotify.access_token_expires.toordinal())
        request.session['token'] = str(spotify.access_token)
   
    headers = {
        "Authorization": f"Bearer {spotify.access_token}"
    }

    return headers

def search_songs(request, text):
    headers = get_spotify_connection(request)
    endpoint = "https://api.spotify.com/v1/search"

    data = urlencode({"q": text, "type": "track", "limit": 30})

    lookup_url = f"{endpoint}?{data}"
    r = requests.get(lookup_url, headers=headers)
    return r.json()

def search_artists(request, text):
    headers = get_spotify_connection(request)
    endpoint = "https://api.spotify.com/v1/search"

    data = urlencode({"q": text, "type": "artist", "limit": 30})

    lookup_url = f"{endpoint}?{data}"
    r = requests.get(lookup_url, headers=headers)
    return r.json()

def search_genres(request):
    headers = get_spotify_connection(request)
    endpoint = "https://api.spotify.com/v1/recommendations/available-genre-seeds"
    data = urlencode({})

    lookup_url = f"{endpoint}?{data}"
    r = requests.get(lookup_url, headers=headers)
    return r.json()

def get_songs(request, emotion, popularity, genres, songs, artists):
    headers = get_spotify_connection(request)
    
    endpoint = "https://api.spotify.com/v1/recommendations"

    # Get possible genres for seeding
    #endpoint = "https://api.spotify.com/v1/recommendations/available-genre-seeds"

    genre_string = ''
    song_string = ''
    artist_string = ''

    if (genres == None or len(genres) == 0) and (songs == None or len(songs) == 0) and (artists == None or len(artists) == 0):
        genre_string = 'pop'
    else:
        if (genres != None and len(genres) > 0):
            for i in range(len(genres)):
                genre_string += genres[i]
                if len(genres) - 1 != i:
                    genre_string += ','
        if (songs != None and len(songs) > 0):
            for i in range(len(songs)):
                        song_string += songs[i]
                        if len(songs) - 1 != i:
                            song_string += ','
        if (artists != None and len(artists) > 0):
            for i in range(len(artists)):
                        artist_string += artists[i]
                        if len(artists) - 1 != i:
                            artist_string += ','

    valence, tempo, energy = get_parameters(emotion)
    data = urlencode({"seed_genres": genre_string, "seed_tracks": song_string, "seed_artists": artist_string, "target_valence": valence, "target_tempo": tempo, "target_popularity": popularity, "target_energy": energy, "limit": 30, "max_liveness": 0.35})

    lookup_url = f"{endpoint}?{data}"
    r = requests.get(lookup_url, headers=headers)
    #print(r.json)
    return r.json()
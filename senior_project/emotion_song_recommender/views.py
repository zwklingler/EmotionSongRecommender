from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
from django.conf.urls.static import static
import logging
from django.views.decorators.csrf import csrf_exempt
import urllib.request


from tensorflow.keras.models import load_model
import tensorflow.keras.backend as backend
from tensorflow.keras.preprocessing import image
import numpy as np
import face_recognition
from cv2 import cv2


def home(request):
    return render(request, 'emotion_song_recommender/index.html')

@csrf_exempt 
def get_emotion(request):
    if request.method == 'POST':
        image = _grab_image(stream=request.FILES["file"])

        face_locations = face_recognition.face_locations(image)
        
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
        
        data = {
            'emotion': emotion_prediction,
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
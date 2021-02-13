# -*- coding: utf-8 -*-
"""
Created on Mon Feb 06 13:42:02 2021

@author: Zachary Klingler
"""

from tensorflow.keras.models import load_model
import tensorflow.keras.backend as backend
from tensorflow.keras.preprocessing import image
from PIL import Image
from matplotlib import pyplot as plt
import numpy as np
import face_recognition
from cv2 import cv2

def get_model(file):
    model = load_model(file)
    return model

def get_face_data(image):
    image = face_recognition.load_image_file(image)
    face_locations = face_recognition.face_locations(image)
    
    top, right, bottom, left = face_locations[0]
    face_image = image[top:bottom, left:right]
    image = Image.fromarray(face_image)

    image = image.resize((48,48),resample=Image.BILINEAR)
    image = image.convert('L')

    plt.imshow(image)

    arr = np.array(list(image.getdata()))
    arr = arr.reshape(1, 48, 48, 1)
    return arr

def predict(model, values):
    model = load_model('emotion_detector_models/ckpt_28-0.3499-0.6822.h5')
    #print(arr[0][0])
    predictions = model.predict(values)
    max_index = np.argmax(predictions)
    
    #emotion_detection = ('angry', 'disgust', 'fear', 'happy', 'sad', 'surprise', 'neutral')
    emotion_detection = ('angry', 'happy', 'sad', 'neutral')
    
    emotion_prediction = emotion_detection[max_index]
    
    print(emotion_prediction)
    print(predictions)
def main():
    file = 'emotion_detector_models/ckpt_28-0.3499-0.6822.h5'
    image = './images/Happy.jpg'
    values = get_face_data(image)
    model = get_model(file)
    predict(model, values)

if __name__ == "__main__":
    # execute only if run as a script
    main()

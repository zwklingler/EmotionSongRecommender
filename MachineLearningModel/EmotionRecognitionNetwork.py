# -*- coding: utf-8 -*-
"""
Created on Sat Feb 04 16:38:23 2021

@author: Zachary Klingler
"""

import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras import optimizers
from tensorflow.keras import layers
from tensorflow.keras.models import Sequential
from tensorflow.keras import callbacks
from tensorflow.keras.layers import Flatten, Dense, Dropout
from tensorflow.keras.layers import Convolution2D, MaxPooling2D, ZeroPadding2D
from tensorflow.keras.optimizers import SGD
from tensorflow.keras.layers import Dense,Dropout,Activation,Flatten,BatchNormalization
from tensorflow.keras.layers import Conv2D, MaxPooling2D
from tensorflow.keras import regularizers
from sklearn.model_selection import train_test_split
from keras.utils import np_utils
import os
from os import listdir
from os.path import isfile, join
from os import path
from PIL import Image
import face_recognition
from matplotlib import pyplot as plt
import tensorflow.keras.backend as backend
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import ReduceLROnPlateau

def get_data():
    ''' Load and format the data from the csv file '''

    file = './fer2013-trimmed.csv'
    emotion_data = pd.read_csv(file, header=0, sep=',')
    data = emotion_data.values
    pixels = data[:, 1]

    x_train = []
    y_train = []
    x_test = []
    y_test = []
    
    for index, row in emotion_data.iterrows():
        k = row['pixels'].split(" ")
        if row['Usage'] == 'Training':
            x_train.append(k)
            y_train.append(row['emotion'])
        else:
            x_test.append(k)
            y_test.append(row['emotion'])
            
    x_train = np.array(x_train).astype(float)
    y_train = np.array(y_train).astype(float)
    
    x_test = np.array(x_test).astype(float)
    y_test = np.array(y_test).astype(float)

    x_train = x_train.reshape(x_train.shape[0], 48, 48, 1)
    x_test = x_test.reshape(x_test.shape[0], 48, 48, 1)
    
    y_train= np_utils.to_categorical(y_train, num_classes=4)
    y_test = np_utils.to_categorical(y_test, num_classes=4)
    
    return x_train, x_test, y_train, y_test

def get_model():
    ''' Builds the model and returns it '''
    model = Sequential()
    model.add(Conv2D(16, (3, 3), activation='relu', padding="same", input_shape=(48,48,1)))
    model.add(Conv2D(16, (3, 3), padding="same", activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Conv2D(32, (3, 3), activation='relu', padding="same"))
    model.add(Conv2D(32, (3, 3), padding="same", activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Conv2D(48, (3, 3), dilation_rate=(2, 2), activation='relu', padding="same"))
    model.add(Conv2D(48, (3, 3), padding="valid", activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Conv2D(64, (3, 3), dilation_rate=(2, 2), activation='relu', padding="same"))
    model.add(Conv2D(64, (3, 3), padding="valid", activation='relu'))
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Flatten())
    model.add(Dense(32, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(4, activation='sigmoid'))
    return model

def train(model):
    ''' Train the model '''

    checkpoint_dir = './emotion_detector_models'
    # Name of the checkpoint files
    checkpoint_prefix = os.path.join(checkpoint_dir, "ckpt_{epoch:02d}-{loss:.4f}-{accuracy:.4f}.h5")
    
    checkpoint = callbacks.ModelCheckpoint(
        filepath=checkpoint_prefix,
        #save_best_only=True,
        verbose=1,
        monitor='val_accuracy')
    lr_reduce = ReduceLROnPlateau(monitor='val_accuracy', factor=0.1, min_delta=0.0001, patience=1, verbose=1)
    callback = [checkpoint, lr_reduce]
    
    x_train, x_test, y_train, y_test = get_data()
    
    # initialize the training data augmentation object
    train_datagen = ImageDataGenerator(
        featurewise_center=False,  
        samplewise_center=False,  
        featurewise_std_normalization=False,  
        samplewise_std_normalization=False,  
        zca_whitening=False,  
        rotation_range=10,  
        zoom_range = 0.0,  
        width_shift_range=0.1,  
        height_shift_range=0.1,  
        horizontal_flip=False, 
        vertical_flip=False) 
    
    #model.compile(optimizer='sgd', loss='categorical_crossentropy', metrics=['accuracy'])
    model.compile(loss='binary_crossentropy',
              optimizer='adam' ,
              metrics=['accuracy'])
    
    batch_size = 32
    epochs = 30
    train_datagen.fit(x_train)

    #model.fit(x_train, y_train, batch_size=batch_size, epochs=epochs, verbose=1, validation_data=(x_test, y_test), callbacks=callback)

    model.fit_generator(
    train_datagen.flow(x_train, y_train, batch_size=batch_size),
    validation_data=(x_test, y_test),
    steps_per_epoch=((x_train.shape[0]) // batch_size),
    callbacks=callback,
    epochs=epochs)
    
def main():
    ''' Main function '''
    model = get_model()
    train(model)

if __name__ == "__main__":
    main()

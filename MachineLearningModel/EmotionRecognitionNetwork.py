# -*- coding: utf-8 -*-
"""
Created on Sat Feb  4 16:38:23 2021

@author: Zachary Klingler
"""

import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
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

def get_data():
    ''' Load and format the data from the csv file '''

    file = './train_trimmed.csv'
    emotion_data = pd.read_csv(file, header=0, sep=',')
    
    data = []
    targets = []
    
    for index, row in emotion_data.iterrows():
        k = row['pixels'].split(" ")
        data.append(np.array(k).astype(float))
        targets.append(float(row['emotion']))
    
    test_size = 0.3
    x_train, x_test, y_train, y_test = train_test_split(data, targets, test_size = test_size, random_state=2)
    x_train = np.array(x_train)
    y_train = np.array(y_train)
    x_test = np.array(x_test)
    y_test = np.array(y_test)

    
    x_train = x_train.reshape(x_train.shape[0], 48, 48, 1)
    x_test = x_test.reshape(x_test.shape[0], 48, 48, 1)
    
    y_train= np_utils.to_categorical(y_train, num_classes=4)
    y_test = np_utils.to_categorical(y_test, num_classes=4)
    
    return x_train, x_test, y_train, y_test


def get_model():
    ''' Builds the model and returns it '''

    model = Sequential()
    model.add(ZeroPadding2D((1,1),input_shape=(48,48,1)))
    model.add(Convolution2D(32, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2,2), strides=(2,2), padding='same'))
    
    model.add(ZeroPadding2D((1,1)))
    model.add(Convolution2D(64, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2,2), strides=(2,2), padding='same'))
    
    model.add(ZeroPadding2D((1,1)))
    model.add(Convolution2D(128, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2,2), strides=(2,2), padding='same'))
    
    model.add(ZeroPadding2D((1,1)))
    model.add(Convolution2D(128, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2,2), strides=(2,2), padding='same'))
    
    
    model.add(ZeroPadding2D((1,1)))
    model.add(Convolution2D(8, (3, 3), activation='relu'))
    model.add(MaxPooling2D((2,2), strides=(2,2), padding='same'))
    
    model.add(Flatten())
    model.add(Dense(4096, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(4096, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(4, activation='softmax'))
    return model

def train(model):
    ''' Train the model '''

   # Directory where the checkpoints will be saved
    checkpoint_dir = './emotion_detector_models'
    # Name of the checkpoint files
    checkpoint_prefix = os.path.join(checkpoint_dir, "ckpt_{epoch:02d}-{loss:.4f}-{accuracy:.4f}.h5")
    
    checkpoint = callbacks.ModelCheckpoint(
        filepath=checkpoint_prefix,
        #save_best_only=True,
        verbose=1,
        monitor='val_acc')
    callback = [checkpoint]
    
    x_train, x_test, y_train, y_test = get_data()
    
    model.compile(optimizer='sgd', loss='categorical_crossentropy', metrics=['accuracy'])
    model.fit(x_train, y_train, batch_size=32, epochs=50, verbose=1, validation_data=(x_test, y_test), callbacks=callback)
        
def main():
    ''' Main function '''
    model = get_model()
    train(model)

if __name__ == "__main__":
    main()

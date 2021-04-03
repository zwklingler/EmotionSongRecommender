<strong>Project Name</strong>
<br>
Emotion Song Recommender

<strong>Summary</strong>
<br>
This application was used as my senior project. Emotion Song Recommender provides a list of songs to the user based upon their current facial expressions.

<strong>How To Use It</strong>
<br>
To start, the user will upload an image of themselves. The website will then determine the emotion of the user from their image, and it will return a list of songs to match their emotion. There are settings that allow the user to detemine how the list of songs is displayed, whether explicit songs are shown, and what the popularity of the songs in the list are. There are also options that allow the user to search for their favorite genre, song, or artist to add to base the recommended songs off of.

<p align="center">
  <img src="https://user-images.githubusercontent.com/43380978/112789314-0c02ed80-901a-11eb-814d-10120dd1c95b.png" alt="Emotion Recommender Sad">
</p>
<br>
<p align="center">
  <img src="https://user-images.githubusercontent.com/43380978/112789317-0d341a80-901a-11eb-82b1-d6c112be6748.png" alt="Emotion Recommender Angry">
</p>


<strong>How It Works</strong>
<br>
The base of the website is a CNN (Convolutional Neural Network). The CNN was trained from thousands of images. The majority of these images were from <a href="https://www.kaggle.com/c/emotion-detection-from-facial-expressions">this kaggle dataset</a>. The rest of the images the CNN was trained on were scraped from the internet. The website allows the user to upload an image. This image is run through the CNN to determine the user's outward facial expression. Then it connects to the Spotify API. It calls the API with different parameters to get songs that are specific for the recognized emotion. These variables include valence, BPM, and energy. The returned list is then displayed to the user.
<br>

<strong>Contributors</strong>
<br>
Zachary Klingler

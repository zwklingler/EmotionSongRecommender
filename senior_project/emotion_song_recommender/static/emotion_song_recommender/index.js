var slidePosition = 0;
var device_id = null;
var token = null;
var player = null;

function swapIcon() {
    let value = document.getElementById("toggle_button").value;
    if (value == "\u25B6") {
        document.getElementById("toggle_button").value = "\u275a" + "\u275a";
    }
    else {
        document.getElementById("toggle_button").value = "\u25B6";
    }
}

function toggle() {
    player.togglePlay();
}

function getAuthorization() {
    const preLocation = 'https://accounts.spotify.com/en/authorize?client_id=3fafec7099c845248a8f80cd2c1d108e&redirect_uri=http://localhost:8000/&response_type=token';
    const scopes = 'user-read-private, user-read-email streaming';
    const location = preLocation + (scopes ? '&scope=' + scopes : '');
    window.location.href = (location);
}

window.onSpotifyWebPlaybackSDKReady = () => {
    if (window.location.hash.length > 0) {
        try {
            var token_variable = window.location.hash.substr(1);
            token = token_variable.split('=')[1].split('&')[0];

            player = new Spotify.Player({
                name: 'Emotion Song Recommender',
                getOAuthToken: cb => { cb(token); }
            });

            // Error handling
            player.addListener('initialization_error', ({ message }) => { 
                console.error(message); 
                resetSpotifyConnect();
            });
            player.addListener('authentication_error', ({ message }) => { 
                console.error(message); 
                resetSpotifyConnect();
            });
            player.addListener('account_error', ({ message }) => { 
                console.error(message); 
                resetSpotifyConnect();
            });
            player.addListener('playback_error', ({ message }) => { 
                console.error(message); 
                resetSpotifyConnect();
            });

            // Playback status updates
            player.addListener('player_state_changed', state => { 
                console.log(state); 
                if (state.paused == false) {
                    document.getElementById("toggle_button").value = "\u275a" + "\u275a";
                }
                else {
                    document.getElementById("toggle_button").value = "\u25B6";
                }
            });

            // Ready
            player.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });

            // Not Ready
            player.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });

            player.on('ready', data => {
                console.log('Ready with Device ID', data.device_id);

                device_id = data.device_id
            });

            // Connect to the player!
            player.connect();
            document.getElementById("spotify_connect").style.display = "none";
        }
        catch (error) {
            resetSpotifyConnect();
        }
    }
}

function loopSongs() {
    $.ajax({
        url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
        type: "PUT",
        data: '{"uris": ["' + trackURI + '"]}',
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + token); },
        success: function (data) {
            console.log(data)
        }
    });
}


function playSong(trackURI) {
    document.getElementById("toggle_button").style.display = "block";
    document.getElementById("toggle_button").value = "\u275a" + "\u275a";
    $.ajax({
        url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
        type: "PUT",
        data: '{"uris": ["' + trackURI + '"]}',
        beforeSend: function (xhr) { xhr.setRequestHeader('Authorization', 'Bearer ' + token); },
        success: function (data) {
            console.log(data)
        }
    });
}

function resetSpotifyConnect()
{
    document.getElementById("spotify_connect").style.display = "block";
    reset_songs();
    token = null;
    player = null;
}

function resetSpotifyConnectKeepSongs()
{
    document.getElementById("spotify_connect").style.display = "block";
    token = null;
    player = null;
}

function isConnected(token, device_id) {
    if (token != null && device_id != null) {
        return true;
    }
    else {

        resetSpotifyConnectKeepSongs();
        return false;
    }
}




window.onload = function () {
    document.getElementById("search_text").addEventListener("keyup", searchEnter);
}

function searchEnter(event) {
    if (event.code === "Enter") {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("search_button").click();
    }
}

function moveForward() {
    showDivs(slidePosition, 1)
}

function moveBackward() {
    showDivs(slidePosition, -1)
}

function showDivs(slideIndex, position) {
    var n = slideIndex + position;
    var x = document.getElementsByClassName("slide");
    if (n > x.length - 1) {
        slidePosition = 0;
    }
    else if (n < 0) {
        slidePosition = x.length - 1;
    }
    else {
        slidePosition = n;
    }

    x[slideIndex].style.display = "none";

    x[slidePosition].style.display = "block";
}

function upload() {
    document.getElementById("spinner").style.display = "inline"
    document.getElementById("error").style.visibility = "hidden"
    reset_songs()

    var fd = new FormData();
    var files = $("#image_file")[0].files;

    var genres = getGenres()
    var songs = getSongs()
    var artists = getArtists()


    // Check file selected or not
    if (files.length > 0) {
        fd.append("file", files[0]);
        fd.append("genres", JSON.stringify(genres))
        fd.append("songs", JSON.stringify(songs))
        fd.append("artists", JSON.stringify(artists))

        $.ajax({
            url: "/get_emotion_songs/",
            type: "POST",
            data: fd,
            dataType: "json",
            contentType: false,
            processData: false,
            success: function (data, status) {
                if (data.error != null) {

                    document.getElementById("error").style.visibility = "visible"
                    document.getElementById("error").textContent = data.error
                }
                else {
                    console.log(data)
                    // Create titles
                    var method = document.getElementById("results_method").value;
                    if (data.songs.tracks.length > 0) {
                        let emotionPrediction = data.emotion
                        document.getElementById("emotion_prediction").innerText = emotionPrediction.charAt(0).toUpperCase() + emotionPrediction.slice(1);
                        if (method == "table") {

                            let div = document.createElement("div");
                            div.setAttribute("class", "song_title");

                            let countTitle = document.createElement("span");
                            countTitle.setAttribute("class", "track_count_title");
                            countTitle.textContent = "Count";
                            div.appendChild(countTitle)

                            let nameTitle = document.createElement("span");
                            nameTitle.setAttribute("class", "track_name_title");
                            nameTitle.textContent = "Track Name";
                            div.appendChild(nameTitle)

                            let artistTitle = document.createElement("span");
                            artistTitle.setAttribute("class", "track_artist_title");
                            artistTitle.textContent = "Track Artist"
                            div.appendChild(artistTitle)

                            document.getElementById("song_results").appendChild(div);
                            var useExplicit = document.getElementById("explicit").checked

                            let songCount = 0;
                            for (let i = 0; i < data.songs.tracks.length; i++) {
                                let track = data.songs.tracks[i]

                                if (useExplicit == true || (useExplicit == false && track.explicit == false)) {
                                    songCount += 1
                                    div = document.createElement("div")
                                    div.setAttribute("class", "song");

                                    // Track count
                                    let count = document.createElement("span");

                                    // If connected to Spotify player
                                    if (isConnected(token, device_id)) {
                                        count.setAttribute("class", "track_count_hover");
                                        count.textContent = songCount + " | Listen";
                                        count.onclick = function () {
                                            playSong(track.uri)
                                        }
                                    }
                                    else {
                                        count.setAttribute("class", "track_count");
                                        count.textContent = songCount;
                                    }
                                    div.appendChild(count)

                                    // Track name
                                    let trackName = document.createElement("span")
                                    trackName.setAttribute("class", "track_name");
                                    trackName.textContent = track.name
                                    // Add On Click
                                    trackName.onclick = function () {
                                        take_to_page(track.external_urls.spotify);
                                    }
                                    div.appendChild(trackName)

                                    // Track artist
                                    let trackArtist = document.createElement("span")
                                    trackArtist.setAttribute("class", "track_artist");
                                    for (var j = 0; j < track.artists.length; j++) {
                                        if (j != 0) {
                                            trackArtist.textContent += ", "
                                        }
                                        trackArtist.textContent += track.artists[j].name
                                    }
                                    trackArtist.onclick = function () {
                                        take_to_page(track.artists[0].external_urls.spotify);
                                    }
                                    div.appendChild(trackArtist)

                                    document.getElementById("song_results").appendChild(div);
                                }
                            }
                        }
                        else {
                            slidePosition = 0;
                            let div = document.createElement("div");
                            div.setAttribute("class", "scroller");
                            div.setAttribute("id", "scroller");


                            let leftButton = document.createElement("button");
                            leftButton.setAttribute("class", "slide_btn_left");
                            leftButton.addEventListener("click", moveBackward);
                            leftButton.textContent = "❮";
                            div.appendChild(leftButton);


                            for (var i = 0; i < data.songs.tracks.length; i++) {
                                let track = data.songs.tracks[i];

                                let slide = document.createElement("div");
                                slide.setAttribute("class", "slide");
                                if (i == 0) {
                                    slide.style.display = "block";
                                }


                                let imageContainer = document.createElement("div");
                                imageContainer.setAttribute("class", "slide_img_container");
                                // If connected to Spotify player
                                if (isConnected(token, device_id)) {
                                    imageContainer.setAttribute("class", "slide_img_container_hover");
                                    imageContainer.onclick = function () {
                                        playSong(track.uri);
                                    }
                                }
                                else {
                                    imageContainer.setAttribute("class", "slide_img_container");
                                }

                                let image = document.createElement("img")
                                image.src = track.album.images[0].url;
                                imageContainer.appendChild(image);


                                slide.appendChild(imageContainer);

                                // Track artist
                                let trackArtist = document.createElement("span");
                                trackArtist.setAttribute("class", "slide_artist");
                                for (var j = 0; j < track.artists.length; j++) {
                                    if (j != 0) {
                                        trackArtist.textContent += ", ";
                                    }
                                    trackArtist.textContent += track.artists[j].name;
                                }
                                trackArtist.onclick = function () {
                                    take_to_page(track.artists[0].external_urls.spotify);
                                }
                                slide.appendChild(trackArtist);

                                // Track name
                                let trackName = document.createElement("span");
                                trackName.setAttribute("class", "slide_song");
                                trackName.textContent = track.name;
                                // Add On Click
                                trackName.onclick = function () {
                                    take_to_page(track.external_urls.spotify);
                                }
                                slide.appendChild(trackName);

                                div.appendChild(slide);
                            }


                            let rightButton = document.createElement("button");
                            rightButton.setAttribute("class", "slide_btn_right");
                            rightButton.addEventListener("click", moveForward);
                            rightButton.textContent = "❯";
                            div.appendChild(rightButton);

                            document.getElementById("song_results").appendChild(div);
                        }
                    }

                    else {
                        document.getElementById("error").style.visibility = "visible";
                        document.getElementById("error").textContent = "No songs were found. Change the settings and try again.";
                    }
                }
                document.getElementById("spinner").style.display = "none";
            },
            error: function () {
                document.getElementById("spinner").style.display = "none";

            }
        });
    }
    else {
        document.getElementById("error").style.visibility = "visible";
        document.getElementById("error").textContent = "Upload an image file";
        document.getElementById("spinner").style.display = "none";
    }
}

function getGenres() {
    selected = document.getElementById("selected_results");
    var genres = [];

    if (selected.childNodes.length > 0) {
        for (var i = 0; i < selected.childNodes.length; i++) {
            if (selected.childNodes[i].childNodes.length >= 2) {
                if (selected.childNodes[i].childNodes[0].innerText == "Genre") {
                    genres.push(selected.childNodes[i].childNodes[1].innerText);
                }
            }
        }
    }
    return genres;
}

function getSongs() {
    selected = document.getElementById("selected_results");
    var songs = [];

    if (selected.childNodes.length > 0) {
        for (var i = 0; i < selected.childNodes.length; i++) {
            if (selected.childNodes[i].childNodes.length >= 3) {
                if (selected.childNodes[i].childNodes[0].innerText == "Song") {
                    songs.push(selected.childNodes[i].childNodes[2].innerText);
                }
            }
        }
    }
    console.log(songs);
    return songs;
}

function getArtists() {
    selected = document.getElementById("selected_results")
    artists = [];

    if (selected.childNodes.length > 0) {
        for (var i = 0; i < selected.childNodes.length; i++) {
            if (selected.childNodes[i].childNodes.length >= 3) {
                if (selected.childNodes[i].childNodes[0].innerText == "Artist") {
                    artists.push(selected.childNodes[i].childNodes[2].innerText);
                }
            }
        }
    }
    console.log(artists);
    return artists;
}

function removeSelected(text, type) {
    var capitalizedType = type.charAt(0).toUpperCase() + type.slice(1);
    selected = document.getElementById("selected_results")
    if (selected.childNodes.length > 0) {
        for (var i = 0; i < selected.childNodes.length; i++) {
            if (selected.childNodes[i].childNodes.length >= 2) {
                if (selected.childNodes[i].childNodes[0].innerText == capitalizedType && selected.childNodes[i].childNodes[1].innerText == text) {
                    objectToRemove = document.getElementById("selected_results").childNodes[i]
                    document.getElementById("selected_results").removeChild(objectToRemove)
                    objectToRemove.remove()
                }
            }
        }
    }
}

function addToSeed(text, type, spotifyId) {
    var selected = document.getElementById("selected_results")
    if (selected.childNodes.length < 6) {
        div = document.createElement("div")
        div.setAttribute("class", "select_result");

        let selectType = document.createElement("span")
        selectType.setAttribute("class", "select_type")
        selectType.innerText = type.charAt(0).toUpperCase() + type.slice(1);
        div.appendChild(selectType)

        let selectText = document.createElement("span")
        selectText.setAttribute("class", "select_text")
        selectText.innerText = text
        div.appendChild(selectText)

        if (spotifyId != null) {
            let selectId = document.createElement("span")
            selectId.setAttribute("class", "select_id")
            selectId.innerText = spotifyId
            div.appendChild(selectId)
        }

        div.onclick = function () {
            removeSelected(text, type);
        }

        document.getElementById("selected_results").appendChild(div)
    }
    else {

    }
}

function search() {
    document.getElementById("search_spinner").style.display = "inline";
    document.getElementById("search_error").style.visibility = "hidden";
    reset_search_results();
    var fd = new FormData();
    search_by = document.getElementById("search_by").value;
    search_text = document.getElementById("search_text").value;


    fd.append("search_by", search_by);
    fd.append("search_text", search_text);

    $.ajax({
        url: "/search/",
        type: "POST",
        data: fd,
        dataType: "json",
        contentType: false,
        processData: false,
        success: function (data, status) {
            document.getElementById("search_spinner").style.display = "none";
            console.log(data);
            if (data.error != null) {
                document.getElementById("search_error").innerText = data.error;
                document.getElementById("search_error").style.visibility = "visible";
            }
            else if (data.songs != null && data.songs.tracks.items.length > 0) {
                for (var i = 0; i < data.songs.tracks.items.length; i++) {
                    div = document.createElement("div")
                    div.setAttribute("class", "search_result");
                    track = data.songs.tracks.items[i];

                    // Search Item Result
                    let searchItem = document.createElement("span")
                    searchItem.setAttribute("class", "search_track");

                    let trackArtist = ""
                    for (var j = 0; j < track.artists.length; j++) {
                        if (j != 0) {
                            trackArtist += ", "
                        }
                        trackArtist += track.artists[j].name
                    }
                    let text = track.name
                    searchItem.innerText = track.name + " by " + trackArtist;
                    div.appendChild(searchItem)
                    // Add On Click
                    div.onclick = function () {
                        addToSeed(text, "song", track.id);
                    }
                    document.getElementById("search_results").appendChild(div);
                }
            }
            else if (data.artists != null && data.artists.artists.items.length > 0) {
                div = document.createElement("div")
                div.setAttribute("class", "search_result");

                for (var i = 0; i < data.artists.artists.items.length; i++) {
                    div = document.createElement("div")
                    div.setAttribute("class", "search_result");
                    artist = data.artists.artists.items[i];

                    // Search Item Result
                    let searchItem = document.createElement("span")
                    searchItem.setAttribute("class", "search_artist");

                    let text = artist.name
                    searchItem.innerText = text;

                    div.appendChild(searchItem)
                    // Add On Click
                    div.onclick = function () {
                        addToSeed(text, "artist", artist.id);
                    }
                    document.getElementById("search_results").appendChild(div);
                }
            }
            else if (data.genres != null && data.genres.length > 0) {
                div = document.createElement("div");
                div.setAttribute("class", "search_result");

                for (var i = 0; i < data.genres.length; i++) {
                    div = document.createElement("div");
                    div.setAttribute("class", "search_result");
                    genre = data.genres[i];

                    // Search Item Result
                    let searchItem = document.createElement("span");
                    searchItem.setAttribute("class", "search_genre");

                    let text = genre;
                    searchItem.innerText = text;

                    div.appendChild(searchItem)
                    // Add On Click
                    div.onclick = function () {
                        addToSeed(text, "genre", null);
                    }
                    document.getElementById("search_results").appendChild(div);
                }
            }
            else {

            }

        },
        error: function () {
            document.getElementById("search_spinner").style.display = "none";
        }
    });
}

function load_file(event) {
    var output = document.getElementById("preview");
    output.style.visibility = "visible"

    // Preview the uploaded file
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function () {
        // Free the memory
        URL.revokeObjectURL(output.src);
    }
}

// Delete all the previous songs
function reset_songs() {
    var parent = document.getElementById("song_results");
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
    document.getElementById("emotion_prediction").innerText = ""
}

function reset_search_results() {
    var parent = document.getElementById("search_results");
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

// Take user to the passed in link
function take_to_page(link) {
    window.open(link, "_newtab")
}
function upload() {
    document.getElementById("spinner").style.display = "inline"
    document.getElementById("error").style.visibility = "hidden"
    reset_songs()

    var fd = new FormData();
    var files = $('#image_file')[0].files;
    var popularity = document.getElementById('popularity').value;

    // Check file selected or not
    if (files.length > 0) {
        fd.append('file', files[0]);
        fd.append('popularity', popularity)

        $.ajax({
            url: '/get_emotion_songs/',
            type: 'POST',
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
                    if (data.songs.tracks.length > 0)
                    {
                        var emotionPrediction = data.emotion
                        document.getElementById("emotion_prediction").innerText =  emotionPrediction.charAt(0).toUpperCase() + emotionPrediction.slice(1);

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
                        var useExplicit = document.getElementById('explicit').checked                 
                        
                        var songCount = 0;
                        for(var i = 0; i < data.songs.tracks.length; i++) {
                            let track = data.songs.tracks[i]
                            console.log(track.explicit)

                            if (useExplicit == true || (useExplicit == false && track.explicit == false))
                            {
                                songCount += 1
                                div = document.createElement("div")
                                div.setAttribute("class", "song");

                                // Track count
                                let count = document.createElement("span");
                                count.setAttribute("class", "track_count");
                                count.textContent = songCount;
                                div.appendChild(count)

                                // Track name
                                let trackName = document.createElement("span")
                                trackName.setAttribute("class", "track_name");
                                trackName.textContent = track.name
                                // Add On Click
                                trackName.onclick = function()
                                {
                                    take_to_page(track.external_urls.spotify);
                                }
                                div.appendChild(trackName)
                                
                                // Track artist
                                let trackArtist = document.createElement("span")
                                trackArtist.setAttribute("class", "track_artist");
                                for (var j = 0; j < track.artists.length; j++)
                                {
                                    if (j != 0)
                                    {
                                        trackArtist.textContent += ", "
                                    }
                                    trackArtist.textContent += track.artists[j].name
                                }
                                trackArtist.onclick = function()
                                {
                                    take_to_page(track.artists[0].external_urls.spotify);
                                }
                                div.appendChild(trackArtist)

                                document.getElementById("song_results").appendChild(div); 
                            }                   
                        }
                        /*
                        span = document.createElement("span")
                        span.textContent = data.emotion
                        span.setAttribute("class", "song");
                        document.getElementById("song_results").appendChild(span);
                        //alert("Data: " + data.emotion + "\nStatus: " + status);
                        */
                    }

                    else
                    {
                        document.getElementById("error").style.visibility = "visible"
                        document.getElementById("error").textContent = "No songs were found. Change the settings and try again."
                    }

                    document.getElementById("spinner").style.display = "none"
                }
            },
            error: function () {
                document.getElementById("spinner").style.display = "none"
                
            }
        });
    }
    else {
        document.getElementById("error").style.visibility = "visible"
        document.getElementById("error").textContent = "Upload an image file"
        document.getElementById("spinner").style.display = "none"
    }
}

// Preview the uploaded file
function load_file(event) {
    var output = document.getElementById('preview');
    output.style.visibility = "visible"
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function () {
        URL.revokeObjectURL(output.src) // free memory
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

// Take user to the passed in link
function take_to_page(link) {
    window.open(link, '_newtab')
}
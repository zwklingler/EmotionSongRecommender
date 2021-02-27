function upload() {
    document.getElementById("spinner").style.display = "inline"
    document.getElementById("error").style.visibility = "hidden"
    reset_songs()

    var fd = new FormData();
    var files = $('#image_file')[0].files;

    // Check file selected or not
    if (files.length > 0) {
        fd.append('file', files[0]);

        $.ajax({
            url: '/get_emotion/',
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
                    span = document.createElement("span")
                    span.textContent = data.emotion
                    span.setAttribute("class", "song");
                    document.getElementById("song_results").appendChild(span);
                    //alert("Data: " + data.emotion + "\nStatus: " + status);

                }
                document.getElementById("spinner").style.display = "none"
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


function load_file(event) {
    var output = document.getElementById('preview');
    output.style.visibility = "visible"
    output.src = URL.createObjectURL(event.target.files[0]);
    output.onload = function () {
        URL.revokeObjectURL(output.src) // free memory
    }
}

function reset_songs() {
    var parent = document.getElementById("song_results");
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}
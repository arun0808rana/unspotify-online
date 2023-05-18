const audioCtrl = document.querySelector('audio');
const searchBar = document.querySelector('#searchBarID');
const resultsContainer = document.querySelector('.results');
const resultsTemplate = document.querySelector('.results-template');
const duration = document.querySelector('.duration');
searchBar.focus();
const errorContainer = document.querySelector('.error-container');

// play/pause listener with space key
document.onkeydown = event => {
    if (event.key === ' ') {
        console.log('Preventing space key emission');
        event.preventDefault();
        if (audioCtrl.src) {
            audioCtrl.focus();
            // if (audioCtrl.paused) {
            //     audioCtrl.play();
            // } else {
            //     audioCtrl.pause();
            // }
        }
    }
}

// preventing propagation of space key bubbling to prevent play/pause listner's firing
searchBar.onkeydown = event => {
    if (event.key === ' ') {
        event.stopPropagation();
    }
}

async function searchQuery(event) {
    try {
        event.preventDefault();
        if (!searchBar.value) {
            return;
        }
        errorContainer.style.display = 'none';
        audioCtrl.style.display = 'none';

        const response = await fetch("/search", {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: searchBar.value }),
        });

        const results = await response.json();
        // console.log("Success:", results);
        if (results.success) {
            resultsContainer.innerHTML = '';
            results.results.map(elm => {
                const newVideoNode = resultsTemplate.content.cloneNode(true);
                newVideoNode.querySelector('.video-container').setAttribute('data-id', elm.id);
                newVideoNode.querySelector('.thumbnail > img').src = elm.thumbnail;
                newVideoNode.querySelector('.thumbnail > .duration').innerText = elm.duration;
                newVideoNode.querySelector('.video-title').innerText = elm.title;
                newVideoNode.querySelector('.video-channel').innerText = elm.channel;
                resultsContainer.appendChild(newVideoNode);
            })
        } else {
            console.log('Success:', false);
            errorContainer.innerText = 'No media found.';
            errorContainer.style.display = 'block';
        }
    } catch (error) {
        console.error("Error:", error);
        errorContainer.innerText = 'No media found.';
        errorContainer.style.display = 'block';
    }
}

async function handleVideoClick(event) {
    const targetVideo = event.target.closest('.video-container');
    // console.log('targetVideo', targetVideo);
    const videoID = targetVideo.getAttribute('data-id');
    // console.log('videoID', videoID);

    try {
        event.preventDefault();
        const response = await fetch("/play", {
            method: "POST", // or 'PUT'
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ videoID: videoID }),
        });

        const results = await response.json();
        // console.log("Success:", results);

        if (results.success) {
            audioCtrl.src = await results.downloadURL;
            audioCtrl.style.display = 'block';
            audioCtrl.play();
            audioCtrl.focus();
        }
    } catch (error) {
        console.error("Error:", error);
    }
}


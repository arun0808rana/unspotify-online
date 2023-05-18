const express = require('express');
const path = require('path');
const app = express();
const port = 7898;

const { getYoutubeSearchResults, getYoutubeDownloadURL } = require('./utils')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile('public/index.html');
})

let searchResults = [];

app.post('/search', (req, res) => {
    const { query } = req.body;
    getYoutubeSearchResults(query).then(results => {
        results = results.filter(result => result.thumbnail !== "");
        searchResults = results;
        res.json({ success: true, results })
    }).catch(error => {
        console.log('Error: ', error.message);
        res.json({ success: false })
    })
})

app.post('/play', (req, res) => {
    const { videoID } = req.body;
    const videoURL = searchResults.find(elm => elm.id == videoID).url;
    getYoutubeDownloadURL(videoURL).then(downloadURL => {
        res.json({ success: true, downloadURL })
    }).catch(error => {
        res.json({ success: false })
    })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
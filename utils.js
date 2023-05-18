const puppeteer = require('puppeteer');

async function getYoutubeSearchResults(query) {
    return new Promise(async (resolve, reject) => {
        query = query.replaceAll(' ', '+');
        let results = [];

        const browser = await puppeteer.launch({ headless: "new" });
        // const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1000 });
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36');

        try {
            await page.goto(`https://www.youtube.com/results?search_query=${query}`);

            const scrollUnits = 4;
            let scrolledPixels = 0;
            for (let i = 0; i < scrollUnits; i++) {
                await sleep(2000); // Adjust the delay as needed
                scrolledPixels = await page.evaluate((scrolledPixels) => {
                    const thumbnailHeight = 252; // including margin-top
                    const thumbnailsOnViewport = 3;
                    let scrollUptoPx = scrolledPixels + (thumbnailHeight * thumbnailsOnViewport);
                    window.scrollTo(0, scrollUptoPx); // Scroll to the bottom of the page
                    return scrollUptoPx;
                }, scrolledPixels);
            }

            results = await page.evaluate(async () => {
                let videoCount = 0;
                const videos = Array.from(document.querySelectorAll('ytd-item-section-renderer ytd-video-renderer'));

                return videos.map(video => {
                    return {
                        id: ++videoCount,
                        thumbnail: video.querySelector('yt-image img').src || '',
                        duration: video.querySelector('ytd-thumbnail-overlay-time-status-renderer').innerText,
                        title: video.querySelector('.text-wrapper #video-title').innerText,
                        url: video.querySelector('.text-wrapper #video-title').href,
                        channel: video.querySelector('.text-wrapper #channel-info').innerText
                    }
                })
            });

            // console.log('results', results);


        } catch (error) {
            console.log('Error: ', error.message);
            reject(error);
        }

        await browser.close();
        // // Listen for the targetdestroyed event
        // browser.on('targetdestroyed', async (target) => {
        //     // Check if the target is the page we opened
        //     if (target === page.target()) {
        //         // Close the browser
        //         await browser.close();
        //     }
        // });
        resolve(results)
    })
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getSearchParamValue(urlString, paramName) {
    const { URL } = require('url');
    const url = new URL(urlString);
    const searchParams = url.searchParams;
    return searchParams.get(paramName);
}

function getYoutubeDownloadURL(videoUrl) {
    return new Promise(async (resolve, reject) => {
        const itag = '140';
        const ytdl = require('ytdl-core');
        try {
            const info = await ytdl.getInfo(videoUrl);
            const format = ytdl.chooseFormat(info.formats, { quality: itag });

            if (format && format.url) {
                resolve(format.url)
            } else {
                throw new Error('Download URL not found for the specified itag.');
            }
        } catch (error) {
            console.error('Error:', error.message);
            reject(error);
        }
    })
}

module.exports = {
    getYoutubeSearchResults,
    getYoutubeDownloadURL
}
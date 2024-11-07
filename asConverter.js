const {launchBrowser} = require('./browser');
const {initJunkTabDetector, cookiesPopupHandler, chapterHandler} = require('./pageController');
const {CHAPTER, URL} = require('./constants');

(async () => {
    const {browser, webPage} = await launchBrowser();

    await webPage.goto(URL);
    await initJunkTabDetector(browser);
    await cookiesPopupHandler(webPage);
    await chapterHandler(webPage);
})()
const {launchBrowser} = require('./browser');
const {initJunkTabDetector, cookiesPopupHandler, chapterHandler} = require('./pageController');
const {NAME_FOLDER, URL, START_CHAPTER, END_CHAPTER} = require('./constants');
const { createNewFolder, createCBZ } = require('./filesUtil');

(async () => {
    const {browser, webPage} = await launchBrowser();

    await webPage.goto(URL);
    await initJunkTabDetector(browser);
    await cookiesPopupHandler(webPage);
    await createNewFolder();
    
    for(let currentChapter = START_CHAPTER; currentChapter <= END_CHAPTER; currentChapter++) {
        await chapterHandler(webPage, currentChapter);
    }
    await createCBZ(`./${NAME_FOLDER}.cbz`);
    console.log('🎉 Panels dowloaded');
    await browser.close();
})()
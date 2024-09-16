const puppeteer = require('puppeteer');
const { CHAPTER, MINDELAY, MAXDELAY, URL } = require('./constants');
const { timeout } = require('puppeteer');

(async () => {


  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1080,1080']
  });
  const webPage = await browser.newPage();
  await webPage.setViewport({ width: 1080, height: 1080 });


  await webPage.goto(URL);


  await initJunkTabDetector(browser);

  await cookiesPopupHandler(webPage);

  await chapterHandler(webPage);




})();

async function cookiesPopupHandler(webPage) {
  try {
    const popup = await webPage.waitForSelector('[role="dialog"]', { timeout: randomDelay() });

    if (popup) {
      const buttonsDiv = await popup.$('div:nth-of-type(3)');
      const buttonAccept = await buttonsDiv.$('button:nth-of-type(2)');
      await buttonAccept.click();
      console.log('🍪 Cookies Pop-up Closed');
    }
  } catch (error) {
    console.log('🛑 No cookies pop-up → Error: ', error);
  }
}

async function chapterHandler(webPage) {
  try {
    const chapterSelector = "Chapitre " + CHAPTER.toString();
    await webPage.select('#selectChapitres', chapterSelector);
  } catch (error) {
    console.log('🛑 No chapter selector → Error: ', error);
  }

  try {
    const pagesGrid = await webPage.waitForSelector('#scansPlacement', { timeout: randomDelay() });
    
    const pages = await pagesGrid.$$('img');
    console.log(pages);


    for (const img of pages) {
      const src = await img.getProperty('src');
      console.log('Source de l\'image:', src.jsonValue());
    }

    
  } catch (error) {
    console.log('🛑 No pages found → Error: ', error);
  }


}

async function getImageURL(webPage, page) {

}

function randomDelay() {
  return Math.floor(Math.random() * (MAXDELAY - MINDELAY + 1) + MINDELAY);
}

async function initJunkTabDetector(browser) {
  browser.on('targetcreated', async (target) => {
    const newPage = await target.page();

    if (newPage) {
      console.log('🗑️ Junk tab detected, closing it...');
      await newPage.close();
    }
  })
}

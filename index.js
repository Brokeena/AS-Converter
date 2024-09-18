const puppeteer = require('puppeteer');
const { CHAPTER, MINDELAY, MAXDELAY, URL, LOADING_URL } = require('./constants');
const path = require('path');

(async () => {


  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1080,1080']
  });
  const webPage = await browser.newPage();
  await webPage.setViewport({ width: 1080, height: 1080 });


  await webPage.goto(URL);

  downloadImages();

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
    await webPage.waitForSelector('#scansPlacement', { timeout: randomDelay() });

    await webPage.waitForFunction(
      url => !Array.from(document.querySelectorAll('img')).some(img => img.src === url),
      {},
      LOADING_URL
    );

    const listImageURL = await webPage.evaluate(() => {
      const images = document.querySelectorAll('#scansPlacement img');
      return Array.from(images).map(img => img.src);
    });

    console.log('🔍 Scans trouvé...');

    for (imageURL in listImageURL) {
      console.log(value);
    }


  } catch (error) {
    console.log('🛑 No pages found → Error: ', error);
  }


}

async function downloadImages() {
  const absosultePath = path.resolve(__dirname);
  console.log('📂 Images will be saved in: ', absosultePath);
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

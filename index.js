const puppeteer = require('puppeteer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');
const { CHAPTER, MINDELAY, MAXDELAY, URL, LOADING_URL } = require('./constants');


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

    for (const urlImg of listImageURL) {
      await downloadImage(urlImg);
    }


  } catch (error) {
    console.log('🛑 No pages found → Error: ', error);
  }

}

async function downloadImage(urlImg) {
  const absolutePath = path.resolve(__dirname);
  const fileName = namingFile(urlImg);
  axios({
    method: 'get',
    url: urlImg,
    responseType: 'stream'
  })
    .then(function (response) {
      response.data.pipe(fs.createWriteStream(fileName));
      console.log('✅ Image downloaded');
    });

}

function randomDelay() {
  return Math.floor(Math.random() * (MAXDELAY - MINDELAY + 1) + MINDELAY);
}

function namingFile(urlImg) {
  const regex = /\/(\d+)\/(\d+)\.jpg$/;
  const match = urlImg.match(regex);

  if (match) {
    const chapter = match[1];
    const page = match[2];
    const result = `${chapter}-${page}`;
    const resultWExtension = `${result}.jpg`;
    return resultWExtension;

  } else {
    console.log("🛑 Error in naming file");

  }
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

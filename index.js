const puppeteer = require('puppeteer');
const path = require('path');
const axios = require('axios');
const fs = require('fs-extra');
const JSZip = require('jszip');
const { CHAPTER, MINDELAY, MAXDELAY, URL, LOADING_URL } = require('./constants');


(async () => {


  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1080,1080']
  });
  const webPage = await browser.newPage();

  
  await createCBZ(`./Chapter-${CHAPTER}.cbz`);

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

    await createNewFolder();
    for (const urlImg of listImageURL) {
      await downloadImage(urlImg);
    }




  } catch (error) {
    console.log('🛑 No pages found → Error: ', error);
  }

}

async function downloadImage(urlImg) {
  const absolutePath = path.resolve(__dirname, `Chapter-${CHAPTER}`);
  const fileName = namingFile(urlImg);
  axios({
    method: 'get',
    url: urlImg,
    responseType: 'stream'
  })
    .then(function (response) {
      response.data.pipe(fs.createWriteStream(path.join(absolutePath, fileName)));
      console.log('✅ Image : ' + fileName + ' downloaded');
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

async function createNewFolder() {
  const folderName = `Chapter-${CHAPTER}`;

  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    } else {
      console.log('🛑 Folder already exists');
    }
  } catch (error) {
    console.log('🛑 Error creating folder → Error: ', error);
  }
}

async function createCBZ(pathDestination) {
  const images = await findImagesPath();

  const zip = new JSZip();

  for(const image of images) {
    const data = fs.readFile(image);
    const fileName = path.basename(image);
    zip.file(fileName, data);
  }

  const content = await zip.generateAsync({ type: 'nodebuffer' });
  await fs.writeFile(pathDestination, content);

}

async function findImagesPath() {
  const folderName = `Chapter-${CHAPTER}`;
  const files = fs.readdirSync(folderName);
  const images = files.filter(file => file.endsWith('.jpg'));
  return images.map(image => path.join(folderName, image));
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

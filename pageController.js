const {LOADING_URL, CHAPTER, MINDELAY, MAXDELAY} = require('./constants');
const {createNewFolder, downloadImage} = require('./filesUtil');

async function initJunkTabDetector(browser) {
    browser.on('targetcreated', async (target) => {
      const newPage = await target.page();
  
      if (newPage) {
        console.log('🗑️ Junk tab detected, closing it...');
        await newPage.close();
      }
    })
}

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

module.exports = {
    initJunkTabDetector,
    cookiesPopupHandler,
    chapterHandler
}

function randomDelay() {
  return Math.floor(Math.random() * (MAXDELAY - MINDELAY + 1) + MINDELAY);
}
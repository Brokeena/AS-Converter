const puppeteer = require('puppeteer');
const { CHAPTER, MINDELAY, MAXDELAY, URL } = require('./constants');

(async () => {
    

    const browser = await puppeteer.launch({
      headless: false,
      args: ['--window-size=1080,1080']
    });
    const page = await browser.newPage();
    await page.setViewport({width: 1080, height: 1080});
  
    
    await page.goto(URL);

    
    await initJunkTabDetector(browser);

    await cookiesPopupHandler(page);

    await chapterHandler(page);

    
    
  })();

  async function cookiesPopupHandler(page){
    try {
      const popup = await page.waitForSelector('[role="dialog"]', {timeout: randomDelay()});
      
      if(popup){
        const buttonsDiv = await popup.$('div:nth-of-type(3)');
        const buttonAccept = await buttonsDiv.$('button:nth-of-type(2)');
        await buttonAccept.click();
        console.log('🍪 Cookies Pop-up Closed');
      }
    } catch (error) {
      console.log('🛑 No cookies pop-up → Error: ', error);
    }
  }

  async function chapterHandler(page) {
    try{
      const chapterSelector = "Chapitre " + CHAPTER.toString();
      await page.select('#selectChapitres', chapterSelector); 
    } catch (error) {
      console.log('🛑 No chapter selector → Error: ', error);
    }    
  }

  function randomDelay() {
    return Math.floor(Math.random() * (MAXDELAY - MINDELAY + 1) + MINDELAY);
  }

  async function initJunkTabDetector(browser){
    browser.on('targetcreated', async (target) => {
      const newPage = await target.page();
      
      if (newPage) {
        console.log('🗑️ Junk tab detected, closing it...');
        await newPage.close();
      }
    })
  }

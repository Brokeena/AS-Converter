const puppeteer = require('puppeteer');

async function launchBrowser() {
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1080,1080']
  });
  const webPage = await browser.newPage();
  return { browser, webPage };
}

module.exports = {launchBrowser};
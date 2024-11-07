const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const { CHAPTER } = require('./constants');

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

module.exports = {
    createNewFolder,
    downloadImage,
    createCBZ
}

async function findImagesPath() {
    const folderName = `Chapter-${CHAPTER}`;
    const files = fs.readdirSync(folderName);
    const images = files.filter(file => file.endsWith('.jpg'));
    return images.map(image => path.join(folderName, image));
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
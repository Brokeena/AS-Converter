const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const JSZip = require('jszip');
const { NAME_FOLDER } = require('./constants');

async function createNewFolder() {
    const folderName = NAME_FOLDER;
  
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
  const absolutePath = path.resolve(__dirname, NAME_FOLDER);
  const fileName = namingFile(urlImg);
  return new Promise((resolve, reject) => {
    axios({
      method: 'get',
      url: urlImg,
      responseType: 'stream'
    })
      .then(function (response) {
        const writer = fs.createWriteStream(path.join(absolutePath, fileName));
        response.data.pipe(writer);
        writer.on('finish', () => { 
          console.log('✅ Image : ' + fileName + ' downloaded');
          resolve();
        });
    });
  });
  

}


async function createCBZ(pathDestination) {
    const images = await findImagesPath();
  
    const zip = new JSZip();
  
    for(const image of images) {
      console.log(`Ajout de l'image : ${image}`);
      const data = await fs.readFile(image);
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
    const folderName = NAME_FOLDER;
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
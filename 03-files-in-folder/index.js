const { stdout } = process;
const fs = require('fs');
const path = require('path');
const {
  colorStringForOutput,
  colorErrorMessage,
} = require('../utils/colorConsoleText');

const folder = 'secret-folder';

function getFolderFiles(folderPath) {
  fs.readdir(folderPath, 'utf8', (err, files) => {
    if (err) {
      throw new Error(colorErrorMessage(`Can't read folder: \n ${err}`));
    }

    files.forEach((file) => {
      getFileInfo(folderPath, file, showFileInfo);
    });
  });
}

function getFileInfo(folderPath, fileName, cb) {
  fs.stat(path.join(folderPath, fileName), (err, stats) => {
    if (err) {
      throw new Error(colorErrorMessage(`Error while reading file:\n ${err}`));
    }

    if (!stats.isFile()) {
      return false;
    }

    const [name, ext] = fileName.split(/\.(?=[0-9a-z]+$)/);
    cb({ name, ext, size: stats.size });
  });
}

function showFileInfo({ name, ext, size }) {
  const formattedName = colorStringForOutput('blue', name.padEnd(10, ' '));
  const formattedExt = colorStringForOutput('yellow', ext.padEnd(5, ' '));
  const formattedSize = colorStringForOutput('cyan', size.toString());
  stdout.write(`${formattedName}${formattedExt}${formattedSize + 'bytes'}\n`);
}

getFolderFiles(path.join(__dirname, folder));

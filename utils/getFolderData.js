const { stdout } = require('process');
const fs = require('fs');
const { colorErrorMessage } = require('./colorConsoleText');

async function getFolderData(folderPath) {
  try {
    const fileNames = [];
    const directoryNames = [];
    const files = await fs.promises.readdir(folderPath, {
      encoding: 'utf8',
      withFileTypes: true,
    });

    for (const file of files) {
      if (file.isFile()) {
        fileNames.push(file);
      } else if (file.isDirectory()) {
        directoryNames.push(file);
      }
    }

    return { fileNames, directoryNames };
  } catch (err) {
    stdout.write(
      colorErrorMessage(`Error while reading files in folder ${folderPath} \n`),
    );
    throw new Error(colorErrorMessage(err));
  }
}

module.exports.getFolderData = getFolderData;

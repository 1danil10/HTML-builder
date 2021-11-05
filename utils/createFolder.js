const { stdout } = require('process');
const fs = require('fs');
const path = require('path');
const {
  colorErrorMessage,
  colorSuccessMessage,
  colorActionMessage,
} = require('./colorConsoleText');

async function createFolder(folderPath) {
  try {
    await fs.promises.mkdir(folderPath, { recursive: true });
    const { dir, name } = path.parse(folderPath);
    stdout.write(
      `Folder ${colorSuccessMessage(name)} ${colorActionMessage(
        'created',
      )} in ${colorSuccessMessage(dir)} \n`,
    );
  } catch (err) {
    stdout.write(colorErrorMessage('Error while create ${folderPath} \n'));
    throw new Error(colorErrorMessage(err));
  }
}

module.exports.createFolder = createFolder;

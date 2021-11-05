const { stdout } = process;
const fs = require('fs');
const path = require('path');
const {
  colorSuccessMessage,
  colorErrorMessage,
  colorActionMessage,
} = require('./colorConsoleText');
const { getFolderData } = require('./getFolderData');
const { createFolder } = require('./createFolder');

async function isFolderExists(folderPath) {
  try {
    await fs.promises.access(
      folderPath,
      fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK,
    );
    stdout.write(
      `Folder ${colorSuccessMessage(folderPath)} already ${colorActionMessage(
        'exists',
      )} \n`,
    );
    return true;
  } catch (e) {
    stdout.write(colorErrorMessage(`Folder ${folderPath} not exists \n`));
    return false;
  }
}

async function removeFolder(folderPath) {
  try {
    await fs.promises.rm(folderPath, { recursive: true });
    stdout.write(
      `Folder ${colorSuccessMessage(folderPath)} ${colorActionMessage(
        'removed',
      )} \n`,
    );
  } catch (err) {
    console.log(
      colorErrorMessage(`error while remove folder: ${folderPath} \n`),
    );
    throw new Error(colorErrorMessage(err));
  }
}

async function copyFile(sourcePath, destinationPath) {
  try {
    await fs.promises.copyFile(sourcePath, destinationPath);
  } catch (err) {
    stdout.write(
      colorErrorMessage(
        `Error while copying file ${sourcePath} to ${destinationPath}`,
      ),
    );
    throw new Error(colorErrorMessage(err));
  }
}

async function copyFolder(sourcePath, destinationPath) {
  const isExist = await isFolderExists(destinationPath);
  if (isExist) {
    await removeFolder(destinationPath);
  }
  createFolder(destinationPath);

  const { fileNames, directoryNames } = await getFolderData(sourcePath);
  fileNames.forEach(({ name }) =>
    copyFile(path.join(sourcePath, name), path.join(destinationPath, name)),
  );

  if (directoryNames.length > 0) {
    directoryNames.forEach(({ name }) =>
      copyFolder(path.join(sourcePath, name), path.join(destinationPath, name)),
    );
  }
  const { name: nameS } = path.parse(sourcePath);
  const { name: nameD, dir: dirD } = path.parse(destinationPath);
  stdout.write(
    `Files successfuly ${colorActionMessage(
      'copied',
    )} from ${colorSuccessMessage(nameS)} to ${colorSuccessMessage(
      nameD,
    )} in ${colorSuccessMessage(dirD)} \n`,
  );
}

module.exports.copyFolder = copyFolder;

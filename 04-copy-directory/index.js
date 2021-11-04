const { stdout } = process;
const fs = require('fs');
const path = require('path');
const {
  colorSuccessMessage,
  colorErrorMessage,
} = require('../utils/colorConsoleText');

async function isFolderExists(folderPath) {
  try {
    await fs.promises.access(
      folderPath,
      fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK,
    );
    stdout.write(colorSuccessMessage(`Folder ${folderPath} already exists \n`));
    return true;
  } catch (e) {
    stdout.write(colorErrorMessage(`Folder ${folderPath} not exists \n`));
    return false;
  }
}

async function removeFolder(folderPath) {
  try {
    await fs.promises.rm(folderPath, { recursive: true });
    stdout.write(colorSuccessMessage(`Folder ${folderPath} removed \n`));
  } catch (err) {
    console.log(
      colorErrorMessage(`error while remove folder: ${folderPath} \n`),
    );
    throw new Error(colorErrorMessage(err));
  }
}

async function createFolder(folderPath) {
  try {
    await fs.promises.mkdir(folderPath, { recursive: true });
    stdout.write(colorSuccessMessage(`Folder ${folderPath} created \n`));
  } catch (err) {
    console.log(colorErrorMessage('Error while create ${folderPath} \n'));
    throw new Error(colorErrorMessage(err));
  }
}

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

  stdout.write(
    colorSuccessMessage(
      `Files successfuly copied from ${sourcePath} to ${destinationPath} \n`,
    ),
  );
}

copyFolder(path.join(__dirname, 'files'), path.join(__dirname, 'files-copy'));

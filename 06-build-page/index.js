// copypaste
const { stdout } = process;
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

const TEXT_COLORS = [
  { name: 'white', code: [37, 89] },
  { name: 'blue', code: [34, 89] },
  { name: 'yellow', code: [33, 89] },
  { name: 'red', code: [31, 89] },
  { name: 'cyan', code: [36, 89] },
  { name: 'green', code: [32, 89] },
  { name: 'magenta', code: [35, 89] },
  { name: 'gray', code: [30, 89] },
];
const whiteTextColor = TEXT_COLORS.find((el) => el.name === 'white');

function colorStringForOutput(textColor, string) {
  const {
    code: [textColorStart, textColorEnd],
  } =
    TEXT_COLORS.find((el) => el.name === textColor.toLowerCase()) ??
    whiteTextColor;

  return `\x1b[${textColorStart}m${string}\x1b[${textColorEnd}m\x1b[0m`;
}

const colorSuccessMessage = colorStringForOutput.bind(null, 'green');
const colorErrorMessage = colorStringForOutput.bind(null, 'red');
const colorActionMessage = colorStringForOutput.bind(null, 'blue');

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

async function createCssBundle(stylesFolderPath, targetFilePath) {
  try {
    let str = await folderDataToString(stylesFolderPath);
    writeFile(targetFilePath, str);
    const { base, dir } = path.parse(targetFilePath);
    stdout.write(
      `${colorSuccessMessage(base)} ${colorActionMessage(
        'created',
      )} in ${colorSuccessMessage(dir)} \n`,
    );
  } catch (err) {
    stdout.write(colorErrorMessage('Error while creating bundle \n'));
    throw new Error(colorErrorMessage(err));
  }
}

async function folderDataToString(folderPath) {
  let codeChunks = [];
  const { fileNames: files, directoryNames } = await getFolderData(folderPath);

  for (const { name: fileName } of files) {
    if (path.extname(fileName).slice(1).toLowerCase() !== 'css') {
      continue;
    }
    codeChunks.push(await readFile(path.join(folderPath, fileName)));
  }

  if (directoryNames.length) {
    for (const { name: directoryName } of directoryNames) {
      codeChunks.push(
        await folderDataToString(path.join(folderPath, directoryName)),
      );
    }
  }
  return codeChunks.join('\n');
}

async function readFile(pathToFile) {
  try {
    return await fsPromises.readFile(pathToFile, { encoding: 'utf8' });
  } catch (err) {
    stdout.write(colorErrorMessage(`Error while reading file ${pathToFile}\n`));
    throw new Error(colorErrorMessage(err));
  }
}

async function writeFile(fileSavePath, content) {
  return await fs.promises.writeFile(fileSavePath, content, {
    encoding: 'utf8',
  });
}

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

async function buildProject() {
  await createFolder(path.join(__dirname, 'project-dist'));
  createCssBundle(
    path.join(__dirname, 'styles'),
    path.join(__dirname, 'project-dist', 'style.css'),
  );
  copyFolder(
    path.join(__dirname, 'assets'),
    path.join(__dirname, 'project-dist', 'assets'),
  );

  const htmlString = await readFile(path.join(__dirname, 'template.html'));
  const htmlStringWithComponents = await insertComponentsParts(
    htmlString,
    path.join(__dirname, 'components'),
  );

  fs.promises.writeFile(
    path.join(__dirname, 'project-dist', 'index.html'),
    htmlStringWithComponents,
  );
  stdout.write(
    `File ${colorSuccessMessage(
      'index.html',
    )} successfully ${colorSuccessMessage('created')}.\n`,
  );
}

async function readFile(filePath) {
  return new Promise((resolve, reject) => {
    var readStream = fs.createReadStream(filePath);
    let file = [];

    readStream.on('data', function (chunk) {
      file.push(chunk);
    });

    readStream.on('error', (err) => {
      if (err) {
        stdout.write(colorErrorMessage(`Can't open file ${filePath}`));
      }
    });
    return readStream.on('end', function () {
      resolve(file.join(''));
    });
  });
}

async function insertComponentsParts(str, componentsPath) {
  const promises = str.split(/{{(.*)}}/).map((chunk) => {
    if (!chunk.match(/^[0-9a-z]+$/i)) {
      return Promise.resolve(chunk);
    } else {
      return new Promise((res, rej) => {
        try {
          fs.stat(path.join(componentsPath, `${chunk}.html`), function (err) {
            if (!err) {
              stdout.write(
                `File ${colorSuccessMessage(
                  chunk + '.html',
                )} ${colorActionMessage('exists')}\n`,
              );
              const data = readFile(path.join(componentsPath, `${chunk}.html`));
              res(data);
            } else if (err.code === 'ENOENT') {
              stdout.write(
                `File ${colorSuccessMessage(
                  chunk + '.html',
                )} ${colorActionMessage('not exists')}. ${colorActionMessage(
                  'Replaced',
                )} with ${colorSuccessMessage('empty string value')}\n`,
              );
              res('');
            }
          });
        } catch (err) {
          stdout.write(
            colorErrorMessage(
              `Error while getting access to file ${chunk}.html`,
            ),
          );
        }
      });
    }
  });
  return Promise.all(promises).then((data) => data.join(''));
}

buildProject();

// copypaste/

// const { stdout } = process;
// const fs = require('fs');

// const path = require('path');
// const {
//   colorErrorMessage,
//   colorSuccessMessage,
//   colorActionMessage,
// } = require('../utils/colorConsoleText');
// const { createFolder } = require('../utils/createFolder');
// const { createCssBundle } = require('../utils/createCssBundle');
// const { copyFolder } = require('../utils/copyFolder');

// async function buildProject() {
//   await createFolder(path.join(__dirname, 'project-dist'));
//   createCssBundle(
//     path.join(__dirname, 'styles'),
//     path.join(__dirname, 'project-dist', 'style.css'),
//   );
//   copyFolder(
//     path.join(__dirname, 'assets'),
//     path.join(__dirname, 'project-dist', 'assets'),
//   );

//   const htmlString = await readFile(path.join(__dirname, 'template.html'));
//   const htmlStringWithComponents = await insertComponentsParts(
//     htmlString,
//     path.join(__dirname, 'components'),
//   );

//   fs.promises.writeFile(
//     path.join(__dirname, 'project-dist', 'index.html'),
//     htmlStringWithComponents,
//   );
//   stdout.write(
//     `File ${colorSuccessMessage(
//       'index.html',
//     )} successfully ${colorSuccessMessage('created')}.\n`,
//   );
// }

// async function readFile(filePath) {
//   return new Promise((resolve, reject) => {
//     var readStream = fs.createReadStream(filePath);
//     let file = [];

//     readStream.on('data', function (chunk) {
//       file.push(chunk);
//     });

//     readStream.on('error', (err) => {
//       if (err) {
//         stdout.write(colorErrorMessage(`Can't open file ${filePath}`));
//       }
//     });
//     return readStream.on('end', function () {
//       resolve(file.join(''));
//     });
//   });
// }

// async function insertComponentsParts(str, componentsPath) {
//   const promises = str.split(/{{(.*)}}/).map((chunk) => {
//     if (!chunk.match(/^[0-9a-z]+$/i)) {
//       return Promise.resolve(chunk);
//     } else {
//       return new Promise((res, rej) => {
//         try {
//           fs.stat(path.join(componentsPath, `${chunk}.html`), function (err) {
//             if (!err) {
//               stdout.write(
//                 `File ${colorSuccessMessage(
//                   chunk + '.html',
//                 )} ${colorActionMessage('exists')}\n`,
//               );
//               const data = readFile(path.join(componentsPath, `${chunk}.html`));
//               res(data);
//             } else if (err.code === 'ENOENT') {
//               stdout.write(
//                 `File ${colorSuccessMessage(
//                   chunk + '.html',
//                 )} ${colorActionMessage('not exists')}. ${colorActionMessage(
//                   'Replaced',
//                 )} with ${colorSuccessMessage('empty string value')}\n`,
//               );
//               res('');
//             }
//           });
//         } catch (err) {
//           stdout.write(
//             colorErrorMessage(
//               `Error while getting access to file ${chunk}.html`,
//             ),
//           );
//         }
//       });
//     }
//   });
//   return Promise.all(promises).then((data) => data.join(''));
// }

// buildProject();

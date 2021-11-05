const { stdout } = process;
const fs = require('fs');

const path = require('path');
const {
  colorErrorMessage,
  colorSuccessMessage,
  colorActionMessage,
} = require('../utils/colorConsoleText');
const { createFolder } = require('../utils/createFolder');
const { createCssBundle } = require('../utils/createCssBundle');
const { copyFolder } = require('../utils/copyFolder');

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

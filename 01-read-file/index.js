const { stdout, stderr } = process;
const fs = require('fs');
const path = require('path');
const {
  colorSuccessMessage,
  colorErrorMessage,
} = require('../utils/colorConsoleText');

function readFromFile(pathToFile, encoding = 'utf-8') {
  let string = '';

  const stream = new fs.ReadStream(pathToFile, {
    encoding,
  });

  stream.on('error', (err) =>
    stderr.write(
      colorErrorMessage(`\nПроизошла ошибка при чтении файла:\n${err}\n\n`),
    ),
  );

  stream.on('readable', function () {
    const data = stream.read();
    if (data === null) {
      return;
    }
    string += data;
  });

  stream.on('end', function () {
    stdout.write(colorSuccessMessage(string));
  });
}

readFromFile(path.join(__dirname, 'text.txt'));

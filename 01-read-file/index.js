const { stdout } = process;
const fs = require('fs');
const path = require('path');

const stream = new fs.ReadStream(path.join(__dirname, 'text.txt'), {
  encoding: 'utf-8',
});
let string = '';

stream.on('readable', function () {
  const data = stream.read();
  if (data === null) {
    return;
  }
  string += data;
});

stream.on('end', function () {
  stdout.write(string);
});

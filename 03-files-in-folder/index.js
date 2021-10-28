const { stdout } = process;
const fs = require('fs');
const path = require('path');

const folder = 'secret-folder';

fs.readdir(path.join(__dirname, folder), 'utf8', (err, files) => {
  if (err) throw err;
  files.forEach((file) => {
    fs.stat(path.join(__dirname, folder, file), (err, stats) => {
      if (stats.isFile()) {
        const [name, ext] = file.split(/\.(?=[0-9a-z]+$)/);

        stdout.write(
          `${name.padEnd(8, ' ')} --- ${ext.padEnd(4, ' ')} --- ${bytes2Kb(
            stats.size,
          ).toFixed(2)}kb \n`,
        );
      }
    });
  });
});

function bytes2Kb(value) {
  return value / 1024;
}

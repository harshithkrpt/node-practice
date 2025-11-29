const fs = require('fs');
const zlib = require('zlib');



fs.createReadStream('./data/big.log')
    .pipe(zlib.createGzip())
    .pipe(fs.createWriteStream('./data/big.log.gz'))
    .on('finish', () => {
        console.log('done');
    })
    .on('error', (err) => {
        console.error(err);
    });
const express = require('express');
const fs = require('fs');
const path = require('path');


const app = express();

app.get('/download', (req, res) => {
    const filePath = path.join(__dirname, 'data.md');
    const stat = fs.statSync(filePath);

    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', 'attachment; filename="data.md"');
    res.setHeader('Content-Type', 'application/md');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    stream.on('error', (err) => {
        res.sendStatus(500);
    });
});

app.listen(3000, (err) => {
    if(err) {
        console.error(err);
        return;
    }
    console.log('server started');
});
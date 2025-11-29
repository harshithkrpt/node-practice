import fs from 'fs';

fs.readFile('nodejs_preadded_objects.js', 'utf-8' ,(err, res) => {
    if(err){
        throw new Error(err);
    }
    console.log(res);
});


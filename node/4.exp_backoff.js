const { promisify } = require('util');
const fs = require('fs');

const retry = async (fn, retries = 5) => {
    let attempt = 0;

    while (true) {
        try {
            return await fn();
        }
        catch (err) {
            if (++attempt > retries) throw err;
            const delay = Math.pow(2, attempt) * 100 + Math.random() * 100;
            await new Promise((r) => setTimeout(r, delay));
        }
    }

}

async function main() {
    try {
        const readFile = promisify(fs.readFile);
        const res = await retry(() => readFile('4.abc.txt', 'utf-8'))
        console.log(res);
    }
    catch (err) {
        console.log(err);
    }

}

main();
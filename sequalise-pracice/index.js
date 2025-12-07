import app from './src/app.js';
import db from './src/db.js';

app.listen(3000, async (err) => {
    try {
        if (!err) {
            console.log("Server Started at Port 3000");
            await db.authenticate();
            console.log("Connection has been Established Successfully");
        }
    }
    catch (err) {
        console.error(err);
    }
});
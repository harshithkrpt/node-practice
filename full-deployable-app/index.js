const app = require("./app");
const { mysqlPool } = require("./db/mysql");

app.listen(process.env.PORT, (err) => {
    if (!err) {
        console.log(`Server Started at port ${process.env.PORT}`)
    }

    mysqlPool
    .getConnection()
    .then((conn) => {
        console.log('✅ MySQL Pool ready');
        conn.release();
    })
    .catch(err => {
        console.error({message: 'mysql connection error', err});
    });
});
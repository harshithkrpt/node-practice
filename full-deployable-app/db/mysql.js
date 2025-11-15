const mysql = require("mysql2");
const mysqlPromises = require("mysql2/promise");


const mysqlConnection = () => {
    const connection = mysql.createConnection({
        database: process.env.MYSQL_DATABASE,
        user:  process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        port: process.env.MYSQL_PORT || 3307,
        host: process.env.MYSQL_HOST || 'localhost'
    });

    connection.connect((error) => {
        if(error) {
            throw new Error("Mysql Connection Failed");
        }
        console.log('✅ Connected to MySQL database');
    });

    return {
        connection,
        endConnection: () => connection.end()
    }
}


const mysqlPool = mysqlPromises.createPool({
        database: process.env.MYSQL_DATABASE,
        user:  process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        port: process.env.MYSQL_PORT || 3306,
        host: process.env.MYSQL_HOST || 'localhost',
        connectionLimit: Number(process.env.MYSQL_POOL_LIMIT) || 10,
        queueLimit: 0,
        waitForConnections: true
});





module.exports = {
    mysqlPool
}
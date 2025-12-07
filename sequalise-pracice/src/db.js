import { Sequelize } from "sequelize";


const sequelize = new Sequelize({
    host: 'localhost',
    dialect: 'mysql',
    pool: {
        max: 10,
        min: 2
    },
    port: 3308,
    username: 'root',
    password: 'ovaledge!',
    database: 'sequelize_db',
    logging: console.log
});

export default sequelize;
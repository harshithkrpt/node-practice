import sequelize from "../db.js";
import { DataTypes } from 'sequelize';

const User = sequelize.define(
    'User',
    {
        firstName: {
            type: DataTypes.STRING,
            allowNull: false  
        },
        lastName: {
            type: DataTypes.STRING
        },
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            autoIncrement: true
        }
    },
    {
        name: 'users'
    }
);

console.log(User === sequelize.models.User);

export default User;
import sequelize from "../db.js";
import User from '../models/User.js';

class UserService {
    static async addUser({
        firstName,
        lastName
    }) {
        try {
            const user = new User({
                firstName,
                lastName
            });
            return user.save();
        }
        catch (err) {
            console.error(err);
        }
    }
}

export default UserService;
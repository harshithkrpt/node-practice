
const getUserService = async (connection, username, getPassword = false) => {
    try {
        if(getPassword) {
            return connection.query("SELECT user_id, username, password FROM users WHERE username=? LIMIT 1", [username]);
        }

        return connection.query("SELECT user_id, username FROM users WHERE username=? LIMIT 1", [username]);
    }
    catch(err) {
        console.error(err);
    }
}


const insertUserService = async (connection, data = {
    username: '',
    password: '',
    firstName: '',
    lastName: ''
}) => {
    try {
        return await connection.query("INSERT INTO users(username, password, first_name, last_name) VALUES(?,?,?,?);", [data.username, data.password, data.firstName, data.lastName]);
    }
    catch(err) {
        console.error(err);
    }
}



module.exports = {
    getUserService,
    insertUserService
}
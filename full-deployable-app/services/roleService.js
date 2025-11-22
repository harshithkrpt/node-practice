
async function insertRoleService(connection, data) {
    try {
       const roles = await connection.query('SELECT role_id FROM roles WHERE role_name = ? LIMIT 1;', [data.roleName]);
       const roleId = roles?.[0]?.[0].role_id;
       await connection.query('INSERT INTO user_roles(user_id, role_id) VALUES (?, ?);', [data.userId, roleId]);
    }
    catch(err) {
        console.error(err);
        throw new Error(err);
    }
}


async function getUserIdRoles(connection, userId) {
    try {
        const roles = await connection.query('SELECT r.role_name FROM user_roles u INNER JOIN roles r ON r.role_id = u.role_id WHERE u.user_id = ?;', [userId]);
        return roles;
    }
    catch(err) {
        console.error(err);
        throw new Error(err);
    }
}

module.exports = {
    insertRoleService,
    getUserIdRoles
};
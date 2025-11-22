function hasSiteReadAccess(connection, userId, siteId) {
    try {
       const [rows] = connection.query(`
        SELECT 1 FROM object_access 
        WHERE user_id = ? AND resource_type = 'SITE' AND resource_id = ? AND access_level IN ('READ', 'WRITE', 'ADMIN');
        `, [userId, siteId]);
        return rows.length > 0;
    }
    catch(err) {
        console.error(err);
        throw new Error(err);
    }
}

function isSiteOwner(connection, userId, siteId) {
    try {
        const [rows] = connection.query(`
            SELECT 1 FROM sites WHERE site_id = ? AND owner_user_id = ?
        `, [siteId, userId]);

        return rows.length > 0;
    }
    catch(err) {
        console.error(err);
        throw new Error(err);
    }
}


module.exports = {
    hasSiteReadAccess,
    isSiteOwner
};
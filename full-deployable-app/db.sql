CREATE DATABASE deployable_app;

USE deployable_app;

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) DEFAULT "",
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN o_auth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN is_oauth BOOLEAN DEFAULT FALSE;

ALTER TABLE users MODIFY COLUMN o_auth_provider VARCHAR(50) DEFAULT "";


CREATE TABLE roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) DEFAULT "",
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO roles(role_name, description) VALUES 
    ('ADMIN', 'Full system access'),
    ('CREATOR', 'Owns sites/objects and approves requests'),
    ('REQUESTOR', 'Requests access to objects or data');


CREATE TABLE permissions (
    permission_id INT PRIMARY KEY AUTO_INCREMENT,
    permission_key VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO permissions (permission_key, description) VALUES 
('request.create', 'Create a new service request'),
('request.view', 'View own requests'),
('request.view_all', 'View all requests'),
('request.approve', 'Approve or reject requests'),
('object.read', 'Read crawled object content'),
('object.write', 'Update or modify object'),
('user.manage', 'Manage users and roles');

CREATE TABLE role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(permission_id) ON DELETE CASCADE
);

INSERT INTO role_permissions (role_id, permission_id) 
    SELECT r.role_id, p.permission_id 
    FROM roles r CROSS JOIN permissions p 
    WHERE r.role_name = 'ADMIN';

INSERT INTO role_permissions (role_id, permission_id) 
    SELECT r.role_id, p.permission_id
    FROM roles r 
    JOIN permissions p ON p.permission_key IN ('request.view_all', 'request.approve', 'object.read', 'object.write')
    WHERE r.role_name = 'CREATOR';

INSERT INTO role_permissions (role_id, permission_id)
    SELECT r.role_id, p.permission_id
    FROM roles r 
    JOIN permissions p ON p.permission_key IN ('request.create', 'request.view', 'object.read')
    WHERE r.role_name = 'REQUESTOR';


CREATE TABLE user_roles (
    user_role_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    scope_type ENUM('GLOBAL', 'OBJECT', 'REQUEST') DEFAULT 'GLOBAL',
    scope_id BIGINT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_user_role_scope (user_id, role_id, scope_type, scope_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(role_id) ON DELETE CASCADE
);

CREATE TABLE object_access (
    object_access_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id BIGINT NOT NULL,
    access_level ENUM ('READ', 'WRITE', 'ADMIN') DEFAULT 'READ',
    granted_by INT NULL,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_object_access (user_id, resource_type, resource_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (granted_by) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE sites (
    site_id INT PRIMARY KEY AUTO_INCREMENT,
    owner_user_id INT NOT NULL,
    url VARCHAR(500) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE service_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    requestor_id INT NOT NULL,
    site_id INT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (requestor_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (site_id) REFERENCES sites(site_id) ON DELETE CASCADE
);

CREATE TABLE crawled_pages (
    page_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    site_id INT NOT NULL,
    url VARCHAR(1000) NOT NULL,
    status_code INT,
    title VARCHAR(500) DEFAULT "",
    content_html LONGTEXT,
    content_text LONGTEXT,
    fetched_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(site_id) 
        ON DELETE CASCADE,
    INDEX idx_crawled_pages_site (site_id),
    INDEX idx_crawled_pages_url (url(255))
);

CREATE TABLE crawl_runs (
    crawl_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    site_id INT NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ended_at DATETIME NULL,
    status ENUM('PENDING', 'RUNNING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
    error_message TEXT,
    FOREIGN KEY (site_id) REFERENCES sites(site_id) 
    ON DELETE CASCADE
);
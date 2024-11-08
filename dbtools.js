const sqlite3 = require('sqlite3').verbose();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const insert_user_to_database = (db_path, user_data) => {
  // Connect to the SQLite database
  const db = new sqlite3.Database(db_path, (err) => {
    if (err) {
      console.error("Error connecting to database:", err.message);
    }
  });

  // SQL statement to check if a user with the same username or email already exists
  const check_sql = `
    SELECT COUNT(*) AS count FROM Users WHERE username = ?
  `;

  // Check if a user already exists with the given username or email
  db.get(check_sql, [user_data.username], (err, row) => {
    if (err) {
      console.error("Error checking existing user:", err.message);
      db.close();
      return;
    }

    if (row.count > 0) {
      console.log("A user with the same username or email already exists.");
      db.close();
      return;
    }

    // SQL statement to insert a new user
    const insert_sql = `
      INSERT INTO Users (username, email, password, role, createdAt, lastLoggedInAt, currentState, isEnabled)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Execute the insert statement
    db.run(
      insert_sql,
      [
        user_data.username,
        user_data.email,
        user_data.password,
        user_data.role,
        user_data.createdAt,
        user_data.lastLoggedInAt,
        user_data.currentState,
        user_data.isEnabled,
      ],
      (err) => {
        if (err) {
          console.error("Error inserting user:", err.message);
        } else {
          console.log(`User added!`);
        }
      }
    );

    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error("Error closing the database:", err.message);
      }
    });
  });
}

const delete_user_from_database = (db_path, username) => {
  // Connect to the SQLite database
  const db = new sqlite3.Database(db_path, (err) => {
    if (err) {
      console.error("Error connecting to database:", err.message);
    }
  });

  // SQL statement to delete a user by username
  const sql = `
    DELETE FROM Users WHERE username = ?
  `;

  // Execute the delete statement
  db.run(sql, [username], function (err) {
    if (err) {
      console.error("Error deleting user:", err.message);
    } else if (this.changes === 0) {
      console.log("No user found with the specified username.");
    } else {
      console.log(`User with username '${username}' has been deleted.`);
    }
  });

  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error("Error closing the database:", err.message);
    }
  });
}

const delete_sessions_jobs = (db_path) => {
  // Connect to the SQLite database
  const db = new sqlite3.Database(db_path, (err) => {
    if (err) {
      console.error("Error connecting to database:", err.message);
    }
  });

  const ssql = `
    DELETE FROM Sessions
  `;

  // Execute the delete statement
  db.run(ssql, [], function (err) {
    if (err) {
      console.error("Error deleting sessions:", err.message);
    } else {
      console.log(`All Sessions are deleted.`);
    }
  });

  const jsql = `
    DELETE FROM Jobs
  `;

  // Execute the delete statement
  db.run(jsql, [], function (err) {
    if (err) {
      console.error("Error deleting jobs:", err.message);
    } else {
      console.log(`All jobs are deleted.`);
    }
  });

  // Close the database connection
  db.close((err) => {
    if (err) {
      console.error("Error closing the database:", err.message);
    }
  });
}



const create_system_user = (userspace, username) => {
    console.log(`Creating system user: ${username}, userspace root: ${userspace}`);
    execSync(`useradd -r -M -s /usr/sbin/nologin ${username}`);
    execSync(`sudo usermod -p "$(openssl passwd -1 'random-strong-password')" ${username}`);

    // Get numeric UID and GID for the newly created user
    const service_username = 'vazkus';
    const uid_output = execSync(`id -u ${service_username}`).toString().trim();
    const gid_output = execSync(`id -g ${service_username}`).toString().trim();
    const uid = parseInt(uid_output);
    const gid = parseInt(gid_output);

    // Create user workspace directory
    const user_dir = path.join(userspace, username);
    console.log(`Creating directory: ${user_dir}`);

    // Create parent directories if they don't exist
    fs.mkdirSync(user_dir, { recursive: true });

    // Set appropriate permissions
    fs.chownSync(user_dir, uid, gid);
    fs.chmodSync(user_dir, '750');
}




// Example usage
const user_data = {
  username: 'nana',
  email: 'vazkus@yahoo.com',
  password: '',
  role: 'USER',
  createdAt: new Date().toISOString(),
  lastLoggedInAt: new Date().toISOString(),
  currentState: "active",
  isEnabled: 1,
};

delete_sessions_jobs(process.env['METRIFFIC_DB_FILE'])
//create_system_user(process.env['METRIFFIC_USERSPACE_NFS_ROOT'], user_data.username)
//insert_user_to_database(process.env['METRIFFIC_DB_FILE'], user_data);
//delete_user_from_database(process.env['METRIFFIC_DB_FILE'], user_data.username);


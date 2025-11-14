const db = require('../config/db.auth.js');

class User {
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (error, results) => {
          if (error) {
            return reject(error);
          }
          return resolve(results[0]);
        }
      );
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.query(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (error, results) => {
          if (error) {
            return reject(error);
          }
          return resolve(results[0]);
        }
      );
    });
  }
}

module.exports = User;

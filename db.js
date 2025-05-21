// db.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Создание таблицы если не существует
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number INTEGER UNIQUE NOT NULL
  )`);
});

module.exports = {
  // Получить список занятых билетов
  getTakenTickets() {
    return new Promise((resolve, reject) => {
      db.all("SELECT number FROM tickets", [], (err, rows) => {
        if (err) return reject(err);
        const taken = rows.map(r => r.number);
        resolve(taken);
      });
    });
  },

  // Зарезервировать билеты
  reserveTickets(numbers) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        const placeholders = numbers.map(() => '?').join(',');
        db.all(`SELECT number FROM tickets WHERE number IN (${placeholders})`, numbers, (err, rows) => {
          if (err) return reject(err);

          if (rows.length > 0) {
            return resolve(false); // уже заняты
          }

          const stmt = db.prepare("INSERT INTO tickets (number) VALUES (?)");
          for (let num of numbers) {
            stmt.run(num);
          }
          stmt.finalize(err => {
            if (err) return reject(err);
            resolve(true);
          });
        });
      });
    });
  }
};
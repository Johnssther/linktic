import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('database.sqlite');

db.serialize(() => {
  // Crear la tabla si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS inventory (
      productId INTEGER PRIMARY KEY,
      quantity INTEGER NOT NULL
    )
  `);

});

export default db;

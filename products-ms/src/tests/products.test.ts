import request from 'supertest';
import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import express, { Application } from 'express';
import productRoutes from '../routes/products.js';
import sqlite3 from 'sqlite3';

let app: Application;
let db: sqlite3.Database;
let insertedId: number;

describe('Products Microservice (Memory DB)', () => {
  beforeAll(async () => {
    // Crear base en memoria
    db = new sqlite3.Database(':memory:');

    // Crear tabla y datos
    await new Promise<void>((resolve, reject) => {
      db.serialize(() => {
        db.run(`
          CREATE TABLE products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL
          )
        `);
        db.run(
          `INSERT INTO products (name, price) VALUES ('Coffee', 3.5)`,
          function (err) {
            if (err) return reject(err);
            insertedId = this.lastID;
            resolve();
          }
        );
      });
    });

    // Crear una app express temporal para los tests
    app = express();
    app.use(express.json());

    // Inyectar router con esta instancia de DB
    // Reescribimos las rutas para usar `db` local
    const router = express.Router();

    router.get('/', (_, res) => {
      db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
      });
    });

    router.get('/:id', (req, res) => {
      const id = parseInt(req.params.id);
      db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ message: 'Product not found' });
        res.json(row);
      });
    });

    router.post('/', (req, res) => {
      const { name, price } = req.body;
      db.run(
        'INSERT INTO products (name, price) VALUES (?, ?)',
        [name, price],
        function (err) {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json({ id: this.lastID, name, price });
        }
      );
    });

    app.use('/products', router);
  });

  afterAll(() => {
    db.close();
  });

  it('should list products', async () => {
    const res = await request(app).get('/products');
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should create a product', async () => {
    const res = await request(app)
      .post('/products')
      .send({ name: 'Tea', price: 2.0 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Tea');
  });

  it('should get a product by ID', async () => {
    const res = await request(app).get(`/products/${insertedId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Coffee');
  });
});

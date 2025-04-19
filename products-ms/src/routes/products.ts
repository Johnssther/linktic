import express, { Request, Response } from 'express';
import db from '../database.js';
import { jsonApiResponse } from '../utils/jsonapi';
import { jsonApiError } from '../utils/jsonapi-error';

const router = express.Router();

// Get Products
router.get('/', (_: Request, res: Response) => {
  try {
    db.all('SELECT * FROM products', [], (err, rows) => {
      if (err) {
        return res.status(500).json(
          jsonApiError(500, 'Database Error', err.message)
        );
      }
      res.json(jsonApiResponse('product', rows));
    });
  } catch (error: any) {
    res.status(500).json(
      jsonApiError(500, 'Unexpected Error', error.message || 'Internal Server Error')
    );
  }
});

// GET /products/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json(jsonApiError(500, 'Database Error', err.message));
      }

      if (!row) {
        return res.status(404).json(jsonApiError(404, 'Product Not Found', `No product with ID ${id}`));
      }

      res.json(jsonApiResponse('product', row));
    });
  } catch (error: any) {
    res.status(500).json(jsonApiError(500, 'Unexpected Error', error.message || 'Internal Error'));
  }
});

// POST /products
router.post('/', (req: Request, res: Response) => {
  try {
    const { name, price } = req.body;

    if (!name || typeof price !== 'number') {
      return res.status(400).json(jsonApiError(400, 'Validation Error', 'Name and price are required'));
    }

    db.run(
      'INSERT INTO products (name, price) VALUES (?, ?)',
      [name, price],
      function (err) {
        if (err) {
          return res.status(500).json(jsonApiError(500, 'Database Error', err.message));
        }

        const newProduct = { id: this.lastID, name, price };
        res.status(201).json(jsonApiResponse('product', newProduct));
      }
    );
  } catch (error: any) {
    res.status(500).json(jsonApiError(500, 'Unexpected Error', error.message || 'Internal Error'));
  }
});

// PUT /products/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { name, price } = req.body;

    if (!name || typeof price !== 'number') {
      return res.status(400).json(jsonApiError(400, 'Validation Error', 'Name and price are required'));
    }

    db.run(
      'UPDATE products SET name = ?, price = ? WHERE id = ?',
      [name, price, id],
      function (err) {
        if (err) {
          return res.status(500).json(jsonApiError(500, 'Database Error', err.message));
        }

        if (this.changes === 0) {
          return res.status(404).json(jsonApiError(404, 'Product Not Found', `No product with ID ${id}`));
        }

        res.json(jsonApiResponse('product', { id, name, price }));
      }
    );
  } catch (error: any) {
    res.status(500).json(jsonApiError(500, 'Unexpected Error', error.message || 'Internal Error'));
  }
});

// DELETE /products/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    db.run('DELETE FROM products WHERE id = ?', [id], function (err) {
      if (err) {
        return res.status(500).json(jsonApiError(500, 'Database Error', err.message));
      }

      if (this.changes === 0) {
        return res.status(404).json(jsonApiError(404, 'Product Not Found', `No product with ID ${id}`));
      }

      res.json({
        meta: {
          message: `Product with ID ${id} was deleted`,
        },
      });
    });
  } catch (error: any) {
    res.status(500).json(jsonApiError(500, 'Unexpected Error', error.message || 'Internal Error'));
  }
});

export default router;

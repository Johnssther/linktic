import express, { Request, Response } from 'express';
import axios from 'axios';
import db from '../database.js';
import { jsonApiResponse } from '../utils/jsonapi';
import { jsonApiError } from '../utils/jsonapi-error';
import { emitInventoryChangeEvent } from '../utils/eventInventory.js';

const router = express.Router();

// GET /inventory/:id - search qty product
router.get('/:id', async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    try {
        db.get('SELECT * FROM inventory WHERE productId = ?', [id], async (err, inventoryRow) => {
            if (err) {
                return res.status(500).json(jsonApiError(500, 'Database Error', err.message));
            }

            if (!inventoryRow) {
                return res.status(404).json(jsonApiError(404, 'Inventory Not Found', `No inventory record for product ${id}`));
            }

            try {
                // 2. get call microservice products
                const productRes = await axios.get(`${process.env.URI_PRODUCTS_MS}/${id}`);
                const productData = productRes.data.data;

                // 3. return product and qty
                return res.json({
                    data: productData,
                    inventory: {
                        quantity: inventoryRow?.quantity,
                        
                    },
                });
            } catch (error: any) {
                return res.status(404).json(
                    jsonApiError(404, 'Product Not Found', `No product with ID ${id} found in product service`)
                );
            }
        });
    } catch (error: any) {
        res.status(500).json(jsonApiError(500, 'Unexpected Error', error.message || 'Internal Error'));
    }
});

// POST /purchase - 
router.post('/purchase', (req: Request, res: Response) => {
  const { productId, qty } = req.body;

  if (!Number.isInteger(productId) || productId <= 0) {
    return res.status(400).json(
      jsonApiError(400, 'Validation Error', 'productId must be a positive integer')
    );
  }

  if (!Number.isInteger(qty) || qty <= 0) {
    return res.status(400).json(
      jsonApiError(400, 'Validation Error', 'qty must be a positive integer')
    );
  }

  db.get('SELECT * FROM inventory WHERE productId = ?', [productId], (err, row) => {
    if (err) {
      return res.status(500).json(jsonApiError(500, 'Database Error', err.message));
    }

    if (!row) {
      return res.status(404).json(
        jsonApiError(404, 'Inventory Not Found', `No inventory for product ID ${productId}`)
      );
    }

    if (row.quantity < qty) {
      return res.status(409).json(
        jsonApiError(409, 'Insufficient Stock', `Only ${row.quantity} units available`)
      );
    }

    const newQuantity = row.quantity - qty;

    db.run(
      'UPDATE inventory SET quantity = ? WHERE productId = ?',
      [newQuantity, productId],
      function (updateErr) {
        if (updateErr) {
          return res.status(500).json(jsonApiError(500, 'Update Error', updateErr.message));
        }

        emitInventoryChangeEvent(productId, newQuantity) // event emission inventary

        const response = jsonApiResponse('inventory', {
          id: productId,
          quantity: newQuantity,
        });

        return res.status(200).json(response);
      }
    );
  });
});

export default router;

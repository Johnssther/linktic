import express, { Application } from 'express';
import productRoutes from './routes/products.js';

const app: Application = express();

app.use(express.json());

app.use('/api/products', productRoutes);

export default app;

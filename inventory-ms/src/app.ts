import express, { Application } from 'express';
import inventoryRoutes from './routes/inventory.js';
import dotenv from 'dotenv';

const app: Application = express();

dotenv.config();

app.use(express.json());
app.use('/api/inventory', inventoryRoutes);

export default app;

import express from 'express';
import {
  createOrder,
  getOrdersByVendor,
  getOrderById,
  updateOrderStatus,
} from '../controllers/orderController.js';

const router = express.Router();

// POST /api/orders -> Create order and broadcast real-time notification
router.post('/', createOrder);

// GET /api/orders/vendor/:stallId -> Fetch orders for vendor dashboard
router.get('/vendor/:stallId', getOrdersByVendor);

// GET /api/orders/:orderId -> Fetch single order for customer tracking
router.get('/:orderId', getOrderById);

// PUT /api/orders/:orderId/status -> Update order/payment status
router.put('/:orderId/status', updateOrderStatus);

export default router;

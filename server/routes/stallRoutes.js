import express from 'express';
import {
  getStalls,
  getStallMenu,
  updateStallStatus,
} from '../controllers/stallController.js';

const router = express.Router();

// GET /api/stalls -> Fetch all Kirba Chowk stalls
router.get('/', getStalls);

// GET /api/stalls/:stallId/menu -> Fetch stall info and its menu items
router.get('/:stallId/menu', getStallMenu);

// PUT /api/stalls/:stallId/status -> Toggle stall open/closed status
router.put('/:stallId/status', updateStallStatus);

export default router;

import { dataStore } from '../services/dataStore.js';

// GET /api/stalls -> Fetch all Kirba Chowk stalls
export const getStalls = async (req, res) => {
  try {
    const stalls = await dataStore.getAllStalls();
    res.status(200).json({
      success: true,
      count: stalls.length,
      data: stalls,
    });
  } catch (error) {
    console.error('Error fetching stalls:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stalls',
      error: error.message,
    });
  }
};

// GET /api/stalls/:stallId/menu -> Fetch stall info and its menu items
export const getStallMenu = async (req, res) => {
  try {
    const { stallId } = req.params;
    const stall = await dataStore.getStallById(stallId);

    if (!stall) {
      return res.status(404).json({
        success: false,
        message: 'Stall not found',
      });
    }

    const menuItems = await dataStore.getMenuItemsByStall(stallId);

    res.status(200).json({
      success: true,
      data: {
        stall,
        menuItems,
      },
    });
  } catch (error) {
    console.error('Error fetching stall menu:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stall menu',
      error: error.message,
    });
  }
};

// PUT /api/stalls/:stallId/status -> Toggle stall open/closed status
export const updateStallStatus = async (req, res) => {
  try {
    const { stallId } = req.params;
    const { isOpen } = req.body;

    if (isOpen === undefined) {
      return res.status(400).json({
        success: false,
        message: 'isOpen boolean status is required',
      });
    }

    const updatedStall = await dataStore.updateStallStatus(stallId, isOpen);

    if (!updatedStall) {
      return res.status(404).json({
        success: false,
        message: 'Stall not found',
      });
    }

    // Broadcast real-time status update to all connected clients & stall room
    const io = req.app.get('io');
    if (io) {
      io.emit('stall_status_changed', {
        stallId,
        isOpen: updatedStall.isOpen,
        stallName: updatedStall.stallName,
      });
    }

    res.status(200).json({
      success: true,
      data: updatedStall,
    });
  } catch (error) {
    console.error('Error updating stall status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update stall status',
      error: error.message,
    });
  }
};

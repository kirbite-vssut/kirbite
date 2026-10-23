import { dataStore } from '../services/dataStore.js';

// POST /api/orders -> Create order & broadcast to vendor room
export const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      hostelDetails,
      stallId,
      items,
      totalAmount,
      paymentMode,
      orderNotes,
    } = req.body;

    // Validation
    if (!customerName || !customerPhone || !stallId || !items || !items.length || totalAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required order fields (customerName, phone, stallId, items, totalAmount)',
      });
    }

    if (!hostelDetails || !hostelDetails.block || !hostelDetails.room) {
      return res.status(400).json({
        success: false,
        message: 'Hostel block and room number are required',
      });
    }

    // Verify stall exists & is open
    const stall = await dataStore.getStallById(stallId);
    if (!stall) {
      return res.status(404).json({
        success: false,
        message: 'Selected stall does not exist',
      });
    }

    if (!stall.isOpen) {
      return res.status(400).json({
        success: false,
        message: `Sorry, ${stall.stallName} is currently closed and not accepting orders.`,
      });
    }

    const orderPayload = {
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      hostelDetails: {
        block: hostelDetails.block.trim(),
        room: hostelDetails.room.trim(),
      },
      stallId,
      items: items.map((item) => ({
        menuItemId: item.menuItemId || item._id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity) || 1,
      })),
      totalAmount: Number(totalAmount),
      paymentMode: paymentMode || 'UPI',
      paymentStatus: paymentMode === 'CASH' ? 'Cash_On_Delivery' : 'Pending',
      orderStatus: 'Received',
      orderNotes: orderNotes ? orderNotes.trim() : '',
    };

    const newOrder = await dataStore.createOrder(orderPayload);

    // Prepare response including UPI URI for client ease
    const upiUri = `upi://pay?pa=${encodeURIComponent(stall.upiId)}&pn=${encodeURIComponent(
      stall.upiName
    )}&am=${encodeURIComponent(newOrder.totalAmount)}&cu=INR&tn=${encodeURIComponent(
      `Kirbite-${newOrder._id.toString().slice(-6)}`
    )}`;

    // Broadcast real-time notification to vendor via Socket.io
    const io = req.app.get('io');
    if (io) {
      // Send to stall-specific room and global listener
      io.to(stallId.toString()).emit('new_order', {
        order: newOrder,
        stallName: stall.stallName,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        order: newOrder,
        stall,
        upiUri,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

// GET /api/orders/vendor/:stallId -> Fetch orders for vendor dashboard
export const getOrdersByVendor = async (req, res) => {
  try {
    const { stallId } = req.params;
    const orders = await dataStore.getOrdersByVendor(stallId);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching vendor orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor orders',
      error: error.message,
    });
  }
};

// GET /api/orders/:orderId -> Fetch single order
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await dataStore.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const stall = await dataStore.getStallById(order.stallId);

    res.status(200).json({
      success: true,
      data: {
        order,
        stall,
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
      error: error.message,
    });
  }
};

// PUT /api/orders/:orderId/status -> Update order/payment status & broadcast to sockets
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const validOrderStatuses = ['Received', 'Preparing', 'Ready', 'Delivered', 'Cancelled'];
    const validPaymentStatuses = ['Pending', 'Confirmed', 'Cash_On_Delivery'];

    if (orderStatus && !validOrderStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid orderStatus. Must be one of: ${validOrderStatuses.join(', ')}`,
      });
    }

    if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid paymentStatus. Must be one of: ${validPaymentStatuses.join(', ')}`,
      });
    }

    const updatedOrder = await dataStore.updateOrderStatus(orderId, {
      orderStatus,
      paymentStatus,
    });

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Broadcast to customer room and vendor room
    const io = req.app.get('io');
    if (io) {
      // Emit to vendor room
      io.to(updatedOrder.stallId.toString()).emit('order_updated', updatedOrder);
      // Emit to specific order room for real-time customer tracking
      io.to(`order_${orderId}`).emit('order_status_updated', updatedOrder);
      // Also broadcast globally for active listeners
      io.emit('order_global_update', {
        orderId,
        orderStatus: updatedOrder.orderStatus,
        paymentStatus: updatedOrder.paymentStatus,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message,
    });
  }
};

const {WebSocketServer } = require('ws');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const mongoose = require('mongoose');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

app.use(cors());
app.use(express.json());

/*
========================
MongoDB Connection
========================
*/

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.error('MongoDB Error:', err);
  });

/*
========================
Order Schema
========================
*/

const orderSchema = new mongoose.Schema({

  incident: String,

  food: String,

  reason: String,

  price: Number,

  status: {
    type: String,
    default: 'cart'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

/*
========================
Gemini Setup
========================
*/

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash'
});

/*
========================
Health Route
========================
*/

app.get('/health', (req, res) => {

  res.json({
    status: 'OK'
  });
});

/*
========================
Analyze Incident
========================
*/

app.post('/api/analyze', async (req, res) => {

  const startTime = Date.now();

  try {

    const { incident } = req.body;

    if (!incident) {
      return res.status(400).json({
        error: 'Incident required'
      });
    }

    const prompt = `
    User situation:
    "${incident}"

    Suggest ONE Indian comfort food.

    Return ONLY valid JSON.

    {
      "food": "food name",
      "reason": "short reason",
      "price": number
    }
    `;

    // Gemini response
    const result =
      await model.generateContent(prompt);

    const text = result.response.text();

    console.log('Gemini raw:', text);

    const cleanJson = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const foodData = JSON.parse(cleanJson);

    // Save to MongoDB
    const newOrder = new Order({

      incident,

      food: foodData.food,

      reason: foodData.reason,

      price: foodData.price
    });

    await newOrder.save();

    const latency =
      Date.now() - startTime;

    res.json({

      ...foodData,

      orderId: newOrder._id,

      latency_ms: latency
    });

  } catch (error) {

    console.error('Analyze Error:', error);

    res.status(500).json({
      error: 'AI chef down'
    });
  }
});

/*
========================
Get Cart
========================
*/

app.get('/api/cart', async (req, res) => {

  try {

    const cartItems = await Order.find({
      status: 'cart'
    }).sort({
      createdAt: -1
    });

    res.json(cartItems);

  } catch (error) {

    res.status(500).json({
      error: 'Failed to fetch cart'
    });
  }
});
app.get('/api/recent', async (req, res) => {

  try {

    const recent =
      await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(recent);

  } catch {

    res.status(500).json({
      error: 'Failed'
    });

  }

});
app.get('/api/orders', async (req, res) => {

  try {

    const orders =
      await Order.find({
        status: 'ordered'
      })
      .sort({
        createdAt: -1
      });

    res.json(orders);

  } catch (error) {

    res.status(500).json({
      error: 'Failed to fetch orders'
    });

  }

});

/*
========================
Checkout Order
========================
*/
function broadcast(data) {

  wss.clients.forEach((client) => {

    if (client.readyState === 1) {

      client.send(
        JSON.stringify(data)
      );

    }

  });

}
app.post('/api/checkout/:id', async (req, res) => {

  try {

    const updatedOrder =
      await Order.findByIdAndUpdate(

        req.params.id,

        {
          status: 'ordered'
        },

        {
          new: true
        }
      );
      broadcast({
        type: 'ORDER_PLACED',
        food: updatedOrder.food,
        orderId: updatedOrder._id
      });

    res.json({
      message: 'Order placed',
      order: updatedOrder
    });

  } catch (error) {

    res.status(500).json({
      error: 'Checkout failed'
    });
  }
});

/*
========================
Server Start
========================
*/

const PORT =
  process.env.PORT || 5000;

const server = app.listen(PORT, () => {

  console.log(`Server running on ${PORT}`);
});
const wss = new WebSocketServer({
  server
});

wss.on('connection', (ws) => {

  console.log('WebSocket client connected');

  ws.send(
    JSON.stringify({
      type: 'CONNECTED',
      message: 'Connected successfully'
    })
  );
});
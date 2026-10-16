const {WebSocketServer } = require('ws');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const mongoose = require('mongoose');

const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

const JWT_SECRET = process.env.JWT_SECRET || 'ffm-dev-secret-change-me';
if (!process.env.JWT_SECRET) {
  console.warn('WARNING: JWT_SECRET not set — using dev fallback. Set JWT_SECRET in production.');
}
const signToken = (userId) => jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });

// Optional auth: attaches req.userId when a valid Bearer token is present,
// otherwise continues as guest (req.userId = null). Existing guest behavior
// is unchanged.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    req.userId = null;
    return next();
  }
  try {
    req.userId = jwt.verify(token, JWT_SECRET).sub;
  } catch {
    req.userId = null;
  }
  next();
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Sign in required' });
  try {
    req.userId = jwt.verify(token, JWT_SECRET).sub;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired — please sign in again' });
  }
}

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

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.model('Order', orderSchema);

/*
========================
User Schema (auth)
========================
*/
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

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
Menu Catalog (shared with client)
========================
Parsed from the client's dishes.js so Gemini always recommends a real,
orderable dish — with a photo, price and mood tags on the client.
*/
let MENU = [];
try {
  const dishesSrc = fs.readFileSync(
    path.join(__dirname, '..', 'client', 'src', 'data', 'dishes.js'),
    'utf8'
  );
  const re = /name: '([^']*)',\s*\n\s*cuisine: '([^']*)',[\s\S]*?price: (\d+),/g;
  let m;
  while ((m = re.exec(dishesSrc))) {
    MENU.push({ name: m[1], cuisine: m[2], price: Number(m[3]) });
  }
  console.log(`Menu catalog loaded: ${MENU.length} dishes`);
} catch (e) {
  console.error('Menu catalog load failed:', e.message);
}

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

app.post('/api/analyze', optionalAuth, async (req, res) => {

  const startTime = Date.now();

  try {

    const { incident } = req.body;

    if (!incident) {
      return res.status(400).json({
        error: 'Incident required'
      });
    }

    const menuList = MENU.map((d) => `${d.name} | ${d.cuisine} | Rs.${d.price}`).join('\n');

    const prompt = `
    You are the AI chef of a comfort-food delivery app. A user describes
    their situation and mood below.

    User situation:
    "${incident}"

    Our menu (dish | cuisine | price):
    ${menuList}

    Pick the ONE menu dish that best fits their emotional situation. Vary
    your picks — don't always choose the most obvious comfort food.

    Return ONLY valid JSON, no markdown fences:

    {
      "food": "<exact dish name from the menu>",
      "reason": "<one warm, specific sentence on why this dish fits their mood>",
      "price": <the menu price as a number>
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

    // Snap to the catalog: exact dish name + authoritative menu price.
    const match = MENU.find(
      (d) => d.name.toLowerCase() === String(foodData.food || '').toLowerCase()
    );
    if (match) {
      foodData.food = match.name;
      foodData.price = match.price;
    }

    // Save to MongoDB
    const newOrder = new Order({

      incident,

      food: foodData.food,

      reason: foodData.reason,

      price: foodData.price,

      userId: req.userId || null
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

app.get('/api/cart', optionalAuth, async (req, res) => {

  try {

    const cartItems = await Order.find({
      status: 'cart',
      userId: req.userId || null
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
app.get('/api/orders', optionalAuth, async (req, res) => {

  try {

    const orders =
      await Order.find({
        status: 'ordered',
        userId: req.userId || null
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
app.post('/api/checkout/:id', optionalAuth, async (req, res) => {

  try {

    const updatedOrder =
      await Order.findOneAndUpdate(

        {
          _id: req.params.id,
          status: 'cart',
          userId: req.userId || null
        },

        {
          status: 'ordered'
        },

        {
          new: true
        }
      );

      if (!updatedOrder) {
        return res.status(404).json({
          error: 'Order not found in your cart'
        });
      }

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
Add to Cart (direct)
========================
Lets the menu / re-order flows add a dish to the cart without going
through /api/analyze. Purely additive — existing routes untouched.
*/

app.post('/api/cart', optionalAuth, async (req, res) => {

  try {

    const { food, reason, price, incident } = req.body;

    if (!food) {
      return res.status(400).json({
        error: 'Food required'
      });
    }

    const newOrder = new Order({

      incident: incident || '',

      food,

      reason: reason || '',

      price: Number(price) || 0,

      status: 'cart',

      userId: req.userId || null

    });

    await newOrder.save();

    res.status(201).json(newOrder);

  } catch (error) {

    console.error('Add to Cart Error:', error);

    res.status(500).json({
      error: 'Failed to add to cart'
    });
  }
});

/*
========================
Remove from Cart
========================
*/

app.delete('/api/cart/:id', optionalAuth, async (req, res) => {

  try {

    const removed = await Order.findOneAndDelete({

      _id: req.params.id,

      status: 'cart',

      userId: req.userId || null

    });

    if (!removed) {
      return res.status(404).json({
        error: 'Cart item not found'
      });
    }

    res.json({
      message: 'Removed from cart'
    });

  } catch (error) {

    console.error('Remove from Cart Error:', error);

    res.status(500).json({
      error: 'Failed to remove from cart'
    });
  }
});

/*
========================
Server Start
========================
*/


/*
========================
Auth — signup / login / me
========================
Real account authentication with bcrypt password hashing and JWT sessions
(7-day tokens). Purely additive — all existing guest flows keep working.
*/

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !name.trim()) return res.status(400).json({ error: 'Please tell us your name' });
    if (!email || !EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email' });
    if (!password || password.length < 6) return res.status(400).json({ error: 'Password needs at least 6 characters' });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'An account with this email already exists — try signing in' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim().slice(0, 60),
      email: email.toLowerCase().trim(),
      passwordHash
    });

    const token = signToken(user._id);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ error: 'Could not create your account — please try again' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(401).json({ error: 'No account found for this email' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Wrong password — try again' });

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ error: 'Could not sign you in — please try again' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email createdAt');
    if (!user) return res.status(401).json({ error: 'Account not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Could not load your profile' });
  }
});

/*
========================
AI Insight Summary
========================
Turns the user's journal aggregates into a warm 2-3 sentence narrative
via Gemini. Purely additive — existing routes untouched. Falls back to a
template summary if the model is unreachable, so the client never breaks.
*/

app.post('/api/insight-summary', async (req, res) => {

  try {

    const { checkins, topMoods, topDishes, spend, streak } = req.body || {};

    const n = Number(checkins) || 0;
    const fallback =
      `You've logged ${n} mood check-in${n === 1 ? '' : 's'}` +
      `${streak ? ` on a ${streak}-day streak` : ''}` +
      `${topMoods && topMoods.length ? `, feeling mostly ${topMoods[0]}` : ''}` +
      `${topDishes && topDishes.length ? ` and reaching for ${topDishes[0]}` : ''}.` +
      ` Keep the streak going — your cravings have a pattern worth following.`;

    if (!n) {
      return res.json({ summary: fallback, ai: false });
    }

    const prompt = `
    You are a warm, witty food-and-mood coach. Write a 2-3 sentence personal
    insight summary for a user of a comfort-food app, based on these stats.
    Be encouraging, specific, and end with one tiny actionable suggestion.
    No emojis. Plain text only.

    Mood check-ins: ${n}
    Day streak: ${streak || 0}
    Top moods: ${(topMoods || []).join(', ') || 'unknown'}
    Top dishes: ${(topDishes || []).join(', ') || 'unknown'}
    Total spend: Rs.${spend || 0}
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text().trim();

    res.json({ summary: summary || fallback, ai: true });

  } catch (error) {

    console.error('Insight Summary Error:', error);

    res.json({
      summary: 'Your patterns are still simmering — keep logging moods and this space will fill with personal insights.',
      ai: false
    });
  }
});

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
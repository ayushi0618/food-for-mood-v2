# Food for Mood AI V2

> AI-powered comfort food recommender that understands your situation and lets you order instantly.


This project demonstrates LLM inference + real-time distributed systems + full-stack development

**Live Demo**: Coming soon 
**Tech Stack**: Node.js, Express, MongoDB, Google Gemini API, WebSockets

### Features
1. **Incident Analysis**: User types any life event → Gemini 1.5 Flash returns personalized food JSON
2. **E-commerce Flow**: Add AI suggestion to cart → Checkout → Order tracking
3. **Real-time Updates**: WebSockets push order status to all clients
4. **Performance**: Latency tracking, caching strategy, error fallbacks for LLM API

### System Design
React Client → Node.js API → Gemini API
                  ↓
               MongoDB ← WebSocket broadcast

### Run Locally
1. `cd server && npm install`
2. Add `.env`: `GEMINI_API_KEY=xxx` and `MONGO_URI=xxx`
3. `npm run dev` → API on `localhost:5000`


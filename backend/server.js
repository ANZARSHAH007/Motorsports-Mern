require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authMiddleware = require('./middleware/auth'); // Import authentication middleware

const userRoutes = require('./routers/User');
const authRoutes = require('./routers/auth');
const carRoutes = require('./routers/Car');
const eventRoutes = require('./routers/Event');
const mechanicRoutes = require('./routers/MechanicsService');
const academyRoutes = require('./routers/Acadmey');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Apply routes
app.use('/api/users', authMiddleware, userRoutes); // Apply auth middleware to user routes
app.use('/api/auth', authRoutes); // No middleware for auth routes
app.use('/api/cars', authMiddleware, carRoutes); // Apply auth middleware to car routes
app.use('/api/events', authMiddleware, eventRoutes); // Apply auth middleware to event routes
app.use('/api/mechanics', authMiddleware, mechanicRoutes); // Apply auth middleware to mechanic routes
app.use('/api/academy', authMiddleware, academyRoutes); // Apply auth middleware to academy routes

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
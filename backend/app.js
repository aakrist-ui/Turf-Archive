const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const arenaRoutes = require('./routes/arenaRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const teamRoutes = require('./routes/teamRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Futsal Booking API Running...');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/arenas', arenaRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/teams', teamRoutes);

module.exports = app;
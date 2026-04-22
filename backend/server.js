const mongoose = require('mongoose');
require('dotenv').config();
const app = require('./app');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => {
    console.warn(`MongoDB unavailable, using local arena fallback: ${err.message}`);
  });

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

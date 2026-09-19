const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
require('dotenv').config();

const app = express();

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Serve static files from the public folder (specifically for image uploads)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

const PORT = process.env.PORT || 5000;
const sequelize = require('./configs/database');
require('./entities'); // Load all entities and relationships before syncing

sequelize.sync({ alter: true }).then(() => {
  console.log('✅ Database synced successfully.');
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}).catch(err => {
  console.error('❌ Error syncing database:', err.message);
  app.listen(PORT, () => console.log(`Server started on port ${PORT} (DB Sync Failed)`));
});
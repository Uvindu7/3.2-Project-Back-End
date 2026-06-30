const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sequelize } = require('./configs/sequelize');

const app = express();

// Connect to Database
connectDB();

// Sync Database
sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced successfully');
}).catch(err => {
  console.error('Error syncing database:', err);
});

// Init Middleware
app.use(cors());
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

// Define Routes
app.use('/api/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

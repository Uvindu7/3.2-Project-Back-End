const sequelize = require('./configs/database');
const User = require('./entities/User');
require('dotenv').config();

const makeAdmin = async (email) => {
  try {
    await sequelize.authenticate();
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      process.exit(1);
    }

    user.isAdmin = true;
    await user.save();
    
    console.log(`✅ Success! ${email} is now an admin.`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit();
  }
};

const emailArg = process.argv[2];
if (!emailArg) {
  console.log('Please provide an email address. Example: node make-admin.js admin@gmail.com');
  process.exit(1);
}

makeAdmin(emailArg);

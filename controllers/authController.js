const User = require('../entities/User');
const supabase = require('../configs/supabase');
const sendEmail = require('../services/emailService');
const { Op } = require('sequelize');

// ─────────────────────────────────────────────
// Register User  (Supabase Auth + DB profile row)
// ─────────────────────────────────────────────
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  // Validate input
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }
  try {
    // Check if a profile with this email already exists
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create auth user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // auto-confirm so login works immediately
    });

    if (authError) {
      return res.status(400).json({ message: authError.message });
    }

    const authUser = authData.user;

    // Insert matching profile row in public.users table
    const newUser = await User.create({
      id: authUser.id, // Supabase Auth UUID
      username,
      email,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin || false,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// ─────────────────────────────────────────────
// Login User  (Supabase Auth)
// ─────────────────────────────────────────────
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const authUser = data.user;
    const token = data.session.access_token;

    // Fetch profile from DB
    const profile = await User.findByPk(authUser.id);

    res.json({
      token,
      user: {
        id: authUser.id,
        username: profile?.username ?? authUser.email,
        email: authUser.email,
        isAdmin: profile?.isAdmin ?? false,
      },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// ─────────────────────────────────────────────
// Get Current User
// ─────────────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ─────────────────────────────────────────────
// Update User Profile
// ─────────────────────────────────────────────
const updateUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare DB profile updates
    const profileUpdate = {};
    if (username) profileUpdate.username = username;

    if (email && email !== user.email) {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Check if email is already taken in profile table
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already in use' });
      }
      profileUpdate.email = email;
    }

    // Update password in Supabase Auth if provided
    if (password) {
      const { error: pwError } = await supabase.auth.admin.updateUserById(req.user.id, {
        password,
      });
      if (pwError) {
        return res.status(400).json({ message: pwError.message });
      }
    }

    // Update email in Supabase Auth if changed
    if (profileUpdate.email) {
      await supabase.auth.admin.updateUserById(req.user.id, {
        email: profileUpdate.email,
      });
    }

    // Update profile row in DB
    await User.update(profileUpdate, { where: { id: req.user.id } });
    const updatedUser = await User.findByPk(req.user.id);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ─────────────────────────────────────────────
// Forgot Password  (custom 6-digit code via email)
// ─────────────────────────────────────────────
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate 6-digit code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes

    // Save code to user profile in Supabase DB
    await User.update({
      reset_code: resetCode,
      reset_code_expires: resetExpires,
    }, { where: { id: user.id } });

    // Send email
    const message = `Your password reset code is ${resetCode}. It expires in 10 minutes.`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2>Password Reset Code</h2>
        <p>Use the following code to reset your password:</p>
        <h1 style="color: #333; letter-spacing: 5px;">${resetCode}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Code - LIYARA Clothing',
        message,
        html,
      });

      res.status(200).json({ message: 'Code sent to email' });
    } catch (err) {
      // Clear code if email fails
      await User.update({ reset_code: null, reset_code_expires: null }, { where: { id: user.id } });
      console.error('Email Error:', err.message);
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// ─────────────────────────────────────────────
// Reset Password  (verify 6-digit code, update via Supabase Auth)
// ─────────────────────────────────────────────
const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;

  try {
    // Find user by email + valid reset code
    const user = await User.findOne({
      where: {
        email,
        reset_code: code,
        reset_code_expires: { [Op.gt]: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // Update password in Supabase Auth
    const { error: pwError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (pwError) {
      return res.status(400).json({ message: pwError.message });
    }

    // Clear reset code from DB
    await User.update({ reset_code: null, reset_code_expires: null }, { where: { id: user.id } });

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateUser,
  forgotPassword,
  resetPassword,
};

const supabase = require('../configs/supabase');

/**
 * Auth Middleware
 * Verifies the Supabase JWT access token sent in the 'x-auth-token' header.
 * Sets req.user = { id: <supabase-auth-uuid> } on success.
 */
module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  // Verify token with Supabase
  try {
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = { id: data.user.id };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

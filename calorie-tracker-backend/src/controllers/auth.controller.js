const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const { verifyGoogleToken } = require('../services/googleAuth.service.js');

async function googleLogin(req, res) {
  try {
    console.log('Received Google login request');
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'idToken is required' });
    }

    const payload = await verifyGoogleToken(idToken);

    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        name,
        avatar: picture,
        googleId: sub,
      });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: 'Invalid Google token' });
  }
}

module.exports = { googleLogin };

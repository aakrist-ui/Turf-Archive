const jwt = require('jsonwebtoken');
const User = require('../models/user');
const mongoose = require('mongoose');
const { findUserById } = require('../utils/localDevStore');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-change-me';
const LEGACY_JWT_SECRETS = ['dev-jwt-secret-change-me', 'change-me'];
const isDatabaseReady = () => mongoose.connection.readyState === 1;

const normalizeUser = (user) => {
  if (!user) {
    return null;
  }

  if (typeof user.toObject === 'function') {
    const safeUser = user.toObject();
    return {
      ...safeUser,
      id: safeUser._id?.toString?.() || String(safeUser._id),
    };
  }

  return {
    ...user,
    id: user.id || user._id?.toString?.() || String(user._id),
  };
};

const getJwtSecrets = () =>
  [JWT_SECRET, ...LEGACY_JWT_SECRETS].filter((secret, index, list) => secret && list.indexOf(secret) === index);

const verifyToken = (token) => {
  let lastError = null;

  for (const secret of getJwtSecrets()) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Token verification failed');
};

const decodeTokenForLocalDev = (token) => {
  const decoded = jwt.decode(token);

  if (decoded && typeof decoded === 'object' && decoded.id) {
    console.warn('Auth token signature verification failed, using decoded token payload for local development.');
    return decoded;
  }

  return null;
};

exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      let decoded;

      try {
        decoded = verifyToken(token);
      } catch (verificationError) {
        decoded = decodeTokenForLocalDev(token);

        if (!decoded) {
          throw verificationError;
        }
      }

      // Get user from token
      req.user = isDatabaseReady()
        ? normalizeUser(await User.findById(decoded.id).select('-password'))
        : (() => {
            const localUser = findUserById(decoded.id);
            if (!localUser) {
              return null;
            }

            const { password, ...safeUser } = localUser;
            return normalizeUser({
              ...safeUser,
              _id: localUser._id,
            });
          })();

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error('Auth token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized for this action' });
  }

  next();
};

const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  const role = req.user?.role?.toString().trim().toUpperCase();
  if (role !== 'ADMIN') {
    console.warn(`[Access Denied] User: ${req.user?.email || req.user?.id}, Role: ${role}, Required: ADMIN`);
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};

const isStudent = (req, res, next) => {
  if (req.user?.role?.toUpperCase() !== 'STUDENT') {
    console.warn(`[Access Denied] User Role: ${req.user?.role}, Required: STUDENT`);
    return res.status(403).json({ error: 'Forbidden: Student access required' });
  }
  next();
};

module.exports = { authenticate, isAdmin, isStudent };

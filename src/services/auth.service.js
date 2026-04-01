const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
  return { accessToken, refreshToken };
};

const signup = async ({ name, email, password, role, phone, latitude, longitude, address }) => {
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role, phone, latitude, longitude, address },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  // Persist refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  return { user, accessToken, refreshToken };
};

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.isActive) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    throw err;
  }

  const { accessToken, refreshToken } = generateTokens(user.id, user.role);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  const { password: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
};

const refreshTokens = async (token) => {
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    const err = new Error('Invalid or expired refresh token');
    err.statusCode = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    const err = new Error('Invalid refresh token');
    err.statusCode = 401;
    throw err;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true, isActive: true },
  });

  if (!user || !user.isActive) {
    const err = new Error('User not found');
    err.statusCode = 401;
    throw err;
  }

  // Rotate token
  await prisma.refreshToken.delete({ where: { token } });
  const { accessToken, refreshToken: newRefresh } = generateTokens(user.id, user.role);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({ data: { token: newRefresh, userId: user.id, expiresAt } });

  return { accessToken, refreshToken: newRefresh };
};

const logout = async (token) => {
  await prisma.refreshToken.deleteMany({ where: { token } });
};

module.exports = { signup, login, refreshTokens, logout };

const authService = require('../services/auth.service');
const prisma = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response');

const signup = async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    return successResponse(res, result, 'Account created successfully', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return errorResponse(res, 'Refresh token required', 400);
    const tokens = await authService.refreshTokens(refreshToken);
    return successResponse(res, tokens, 'Tokens refreshed');
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await authService.logout(refreshToken);
    return successResponse(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, latitude: true, longitude: true, address: true,
        avgRating: true, ratingCount: true, createdAt: true,
      },
    });
    return successResponse(res, user);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, latitude: true, longitude: true, address: true,
      },
    });
    return successResponse(res, user, 'Profile updated');
  } catch (err) {
    next(err);
  }
};

module.exports = { signup, login, refresh, logout, getMe, updateProfile };

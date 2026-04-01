const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }
  req.body = result.data;
  next();
};

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['DONOR', 'NGO', 'VOLUNTEER']),
  phone: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

const foodListingSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  quantity: z.number().int().positive(),
  unit: z.string().default('servings'),
  foodType: z.enum(['VEG', 'NON_VEG', 'COOKED', 'RAW', 'PACKAGED']).default('VEG'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  expiryTime: z.string().datetime({ message: 'Invalid ISO date string' }),
});

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  address: z.string().optional(),
});

const ratingSchema = z.object({
  toUserId: z.string().uuid(),
  deliveryId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  review: z.string().max(500).optional(),
});

const deliveryStatusSchema = z.object({
  status: z.enum(['PICKED', 'IN_TRANSIT', 'DELIVERED']),
  currentLat: z.number().optional(),
  currentLng: z.number().optional(),
});

module.exports = {
  validate,
  signupSchema,
  loginSchema,
  foodListingSchema,
  updateProfileSchema,
  ratingSchema,
  deliveryStatusSchema,
};

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const { registerValidation, loginValidation, handleValidation } = require('../utils/validators');

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string, example: Mridul Sharma }
 *               email: { type: string, example: mridul@example.com }
 *               password: { type: string, example: secret123 }
 *               role: { type: string, enum: [user, admin], example: user }
 *     responses:
 *       201: { description: User registered successfully }
 *       409: { description: Email already registered }
 */
router.post('/register', registerValidation, handleValidation, register);

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in and receive a JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: mridul@example.com }
 *               password: { type: string, example: secret123 }
 *     responses:
 *       200: { description: Login successful, returns JWT token }
 *       401: { description: Invalid credentials }
 */
router.post('/login', loginValidation, handleValidation, login);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Get the currently logged-in user's profile
 *     tags: [Auth]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Current user profile }
 *       401: { description: Not authenticated }
 */
router.get('/me', authenticate, getMe);

module.exports = router;

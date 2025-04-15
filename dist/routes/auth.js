import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@models/User';
import { BlacklistedToken } from '@models/BlacklistedToken';
import { authenticate } from '@middleware/auth';
import dotenv from 'dotenv';
dotenv.config();
const router = Router();
const validateInput = (data, type = 'login') => {
    const errors = {};
    if (type === 'register') {
        if (!data.name?.trim())
            errors.name = 'Имя обязательно';
    }
    if (!data.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.email = 'Некорректный email';
    }
    if (!data.password || data.password.length < 6) {
        errors.password = 'Пароль должен содержать минимум 6 символов';
    }
    return {
        errors,
        isValid: Object.keys(errors).length === 0,
    };
};
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Аутентификация и авторизация пользователей
 */
/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Иван Иванов"
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Пользователь успешно зарегистрирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Регистрация успешна"
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации или email уже занят
 */
router.post('/register', async (req, res) => {
    try {
        const { errors, isValid } = validateInput(req.body, 'register');
        if (!isValid) {
            return res.status(400).json({ success: false, errors });
        }
        const existingUser = await User.findOne({
            where: { email: req.body.email },
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                errors: { email: 'Пользователь с таким email уже существует' },
            });
        }
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error('JWT_SECRET не задан');
        const token = jwt.sign({ id: user.id, email: user.email }, secret, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        });
        return res.status(201).json({
            success: true,
            message: 'Регистрация успешна',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
        });
    }
    catch (error) {
        console.error('Ошибка регистрации:', error);
        return res.status(500).json({
            success: false,
            message: 'Ошибка сервера',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Неверные учетные данные
 */
router.post('/login', async (req, res) => {
    try {
        const { errors, isValid } = validateInput(req.body);
        if (!isValid) {
            return res.status(400).json({ success: false, errors });
        }
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Неверные учетные данные',
            });
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Неверные учетные данные',
            });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret)
            throw new Error('JWT_SECRET не задан');
        const token = jwt.sign({ id: user.id, email: user.email }, secret, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        });
        return res.json({
            success: true,
            message: 'Вход выполнен',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
        });
    }
    catch (error) {
        console.error('Ошибка входа:', error);
        return res.status(500).json({
            success: false,
            message: 'Ошибка сервера',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Выход из системы
 *     description: Инвалидирует текущий JWT-токен.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Выход выполнен
 *       401:
 *         description: Неавторизованный доступ
 *       500:
 *         description: Ошибка сервера
 */
router.post('/logout', authenticate, async (req, res) => {
    try {
        const { token } = req.auth;
        const exists = await BlacklistedToken.findByPk(token);
        if (exists) {
            return res.status(400).json({
                success: false,
                message: 'Токен уже заблокирован',
            });
        }
        const decoded = jwt.decode(token);
        const exp = decoded?.exp ?? Math.floor(Date.now() / 1000) + 3600;
        await BlacklistedToken.create({
            token,
            expiresAt: new Date(exp * 1000),
        });
        return res.json({
            success: true,
            message: 'Выход выполнен',
        });
    }
    catch (error) {
        console.error('Ошибка выхода:', error);
        return res.status(500).json({
            success: false,
            message: 'Ошибка сервера',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
});
/**
 * @swagger
 * /auth/check-auth:
 *   get:
 *     summary: Проверка авторизации
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Токен валиден
 *       401:
 *         description: Неавторизованный доступ
 *       500:
 *         description: Ошибка сервера
 */
router.get('/check-auth', authenticate, (req, res) => {
    return res.json({
        success: true,
        user: req.auth.user,
    });
});
export default router;

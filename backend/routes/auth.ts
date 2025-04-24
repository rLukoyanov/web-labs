import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CreationAttributes } from 'sequelize';
import { User } from '@models/User';
import { BlacklistedToken } from '@models/BlacklistedToken';
import { authenticate } from '@middleware/auth';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *       properties:
 *         name:
 *           type: string
 *           example: "Иван Иванов"
 *         email:
 *           type: string
 *           format: email
 *           example: "ivan@example.com"
 *         password:
 *           type: string
 *           example: "password123"
 *         gender:
 *           type: string
 *           example: "male"
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "ivan@example.com"
 *         password:
 *           type: string
 *           example: "password123"
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Регистрация успешна"
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             created_at:
 *               type: string
 *               format: date-time
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Ошибка сервера"
 *         errors:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "Пользователь с таким email уже существует"
 */

interface AuthRequest extends Request {
  auth?: {
    user: Partial<User>;
    token: string;
  };
}

interface JwtUserPayload {
  id: string;
  email: string;
  exp?: number;
}

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

const validateRegisterInput = (data: Partial<RegisterInput>) => {
  const errors: Record<string, string> = {};

  if (!data.name?.trim()) errors.name = 'Имя обязательно';
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

const validateLoginInput = (data: Partial<LoginInput>) => {
  const errors: Record<string, string> = {};

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
 * /auth/register:
 *   post:
 *     summary: Регистрация нового пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Успешная регистрация
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Ошибка валидации или пользователь уже существует
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { errors, isValid } = validateRegisterInput(req.body);

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

    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      gender: req.body.gender,
      birthDate: new Date().toISOString()
    };

    console.log('Creating user with data:', { ...userData, password: '[HIDDEN]' });

    const user = await User.create(userData as CreationAttributes<User>);

    console.log('User created successfully:', { id: user.id, email: user.email });

    const secret = process.env.JWT_SECRET||"123";
    if (!secret) throw new Error('JWT_SECRET не задан');

    const token = jwt.sign(
      { id: user.id, email: user.email },
      secret as string,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      } as jwt.SignOptions,
    );

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
  } catch (error) {
    const err = error as Error;
    console.error('Детальная ошибка регистрации:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Вход пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Успешный вход
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Ошибка валидации
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Неверные учетные данные
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { errors, isValid } = validateLoginInput(req.body);

    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Неверные учетные данные' });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: 'Неверные учетные данные' });
    }

    const secret = process.env.JWT_SECRET||"123";
    if (!secret) throw new Error('JWT_SECRET не задан');

    const token = jwt.sign(
      { id: user.id, email: user.email },
      secret as string,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      } as jwt.SignOptions, // Указываем тип для options
    );

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
  } catch (error) {
    const err = error as Error;
    console.error('Ошибка входа:', err);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Выход пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Успешный выход
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
 *                   example: "Выход выполнен"
 *       400:
 *         description: Токен уже заблокирован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Ошибка сервера
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { token } = authReq.auth!;

    const exists = await BlacklistedToken.findByPk(token);
    if (exists) {
      return res
        .status(400)
        .json({ success: false, message: 'Токен уже заблокирован' });
    }

    const decoded = jwt.decode(token) as JwtUserPayload | null;
    const exp = decoded?.exp ?? Math.floor(Date.now() / 1000) + 3600;

    await BlacklistedToken.create({
      token,
      expiresAt: new Date(exp * 1000),
    } as CreationAttributes<BlacklistedToken>);

    return res.json({ success: true, message: 'Выход выполнен' });
  } catch (error) {
    const err = error as Error;
    console.error('Ошибка выхода:', err);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
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
 *         description: Успешная проверка авторизации
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Не авторизован
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/check-auth', authenticate, (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  return res.json({
    success: true,
    user: authReq.auth?.user,
  });
});

/**
 * @swagger
 * /auth/update:
 *   put:
 *     summary: Обновление данных пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Новый Иван"
 *               email:
 *                 type: string
 *                 example: "newivan@example.com"
 *               password:
 *                 type: string
 *                 example: "newpassword123"
 *               gender:
 *                 type: string
 *                 example: "male"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *     responses:
 *       200:
 *         description: Обновление успешно
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Ошибка сервера
 */
const validateUpdateInput = (data: Partial<RegisterInput>) => {
  const errors: Record<string, string> = {};

  if (data.name !== undefined && !data.name.trim()) {
    errors.name = 'Имя не может быть пустым';
  }
  if (data.email !== undefined && !data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    errors.email = 'Некорректный email';
  }
  if (data.password !== undefined && data.password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
};



router.put('/update', authenticate, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const userId = authReq.auth?.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Не авторизован' });
    }

    const { errors, isValid } = validateUpdateInput(req.body);
    if (!isValid) {
      return res.status(400).json({ success: false, errors });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatableFields = ['name', 'email', 'password', 'gender', 'birthDate'];
    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (user as any)[field] = req.body[field];
      }
    });

    await user.save();

    return res.json({
      success: true,
      message: 'Данные пользователя обновлены',
      user: {
        ...user.dataValues
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Ошибка обновления пользователя:', err);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});


export default router;

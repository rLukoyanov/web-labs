import { Router, Request, Response } from 'express';
import { User } from '@models/User';
import { literal, CreationAttributes } from 'sequelize';

const router = Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Получить список всех пользователей
 *     description: Возвращает список всех пользователей, фильтруя удалённых.
 *     responses:
 *       200:
 *         description: Список пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Ошибка при получении пользователей
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      where: literal('"deletedAt" IS NULL') as any, // ✅ обход строгой типизации
    });

    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({
      error: 'Ошибка при получении пользователей',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Создание нового пользователя
 *     description: Создаёт нового пользователя.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *       400:
 *         description: Ошибка валидации (не все поля заполнены или email уже существует)
 *       500:
 *         description: Ошибка при создании пользователя
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: 'Имя и email обязательны для заполнения',
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        error: 'Пользователь с таким email уже существует',
      });
    }

    const user = await User.create({ name, email } as CreationAttributes<User>); // ✅ типизировано

    res.status(201).json(user);
  } catch (error: any) {
    res.status(500).json({
      error: 'Ошибка при создании пользователя',
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Мягкое удаление пользователя
 *     description: Помечает пользователя как удалённого, устанавливая поле deletedAt.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID пользователя
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Пользователь помечен как удалённый
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка при удалении пользователя
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    await user.update({ deletedAt: new Date() });

    res.status(200).json({
      message: 'Пользователь помечен как удалённый',
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Ошибка при удалении пользователя',
      details: error.message,
    });
  }
});

export default router;

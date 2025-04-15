import jwt from 'jsonwebtoken';
import { User } from '@models/User';
import { BlacklistedToken } from '@models/BlacklistedToken';
import dotenv from 'dotenv';
dotenv.config();
export const authenticate = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            success: false,
            message: 'Требуется токен авторизации',
        });
    }
    const token = authHeader.split(' ')[1].trim();
    try {
        // 1. Проверка токена
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
        // 2. Поиск пользователя
        const user = await User.findOne({
            where: { id: decoded.id },
            attributes: { exclude: ['password'] },
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Пользователь не найден',
            });
        }
        // 3. Проверка в черном списке
        const exists = await BlacklistedToken.findByPk(token);
        if (exists) {
            console.log(`Токен заблокирован: ${token}`);
            return res.status(401).json({
                success: false,
                message: 'Токен заблокирован',
            });
        }
        req.auth = {
            user: user.get({ plain: true }),
            token,
        };
        next();
    }
    catch (err) {
        console.error('Auth error:', err);
        const response = {
            success: false,
            message: 'Неверный токен',
        };
        if (err.name === 'TokenExpiredError') {
            response.message = 'Токен истек';
        }
        if (process.env.NODE_ENV === 'development') {
            response.error = err.message;
        }
        return res.status(401).json(response);
    }
};

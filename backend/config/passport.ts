import passport from 'passport';
import {
  Strategy as JwtStrategy,
  ExtractJwt,
  StrategyOptions,
} from 'passport-jwt';
import { User } from '@models/User';
import { BlacklistedToken } from '@models/BlacklistedToken';
import { Request } from 'express';
import dotenv from 'dotenv';

dotenv.config();

// Типизация полезной нагрузки JWT
interface JwtPayload {
  id: number;
  iat: number;
  exp: number;
}

const opts: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your_secret_key',
  passReqToCallback: true, // позволяет передавать req в стратегию
};

passport.use(
  new JwtStrategy(
    opts,
    async (
      req: Request,
      jwtPayload: JwtPayload,
      done: (_err: Error | null, _user: User | false | undefined) => void,
    ) => {
      try {
        // Получаем токен вручную из заголовков
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

        if (!token) {
          return done(null, false); // Передаем null для ошибки и false для пользователя
        }

        const isBlacklisted = await BlacklistedToken.findOne({
          where: { token },
        });

        if (isBlacklisted) {
          return done(null, false); // Если токен в черном списке, возвращаем false
        }

        const user = await User.findByPk(jwtPayload.id);

        if (user) {
          return done(null, user); // Если пользователь найден, возвращаем его
        }

        return done(null, false); // Если пользователь не найден, возвращаем false
      } catch (_err) {
        return done(_err as Error, false); // В случае ошибки передаем ошибку и false для пользователя
      }
    },
  ),
);

export default passport;

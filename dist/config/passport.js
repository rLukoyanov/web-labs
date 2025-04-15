import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '@models/User';
import { BlacklistedToken } from '@models/BlacklistedToken';
import dotenv from 'dotenv';
dotenv.config();
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your_secret_key',
    passReqToCallback: true, // позволяет передавать req в стратегию
};
passport.use(new JwtStrategy(opts, async (req, jwtPayload, done) => {
    try {
        // Получаем токен вручную из заголовков
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (!token)
            return done(null, false);
        const isBlacklisted = await BlacklistedToken.findOne({ where: { token } });
        if (isBlacklisted) {
            return done(null, false);
        }
        const user = await User.findByPk(jwtPayload.id);
        if (user) {
            return done(null, user);
        }
        return done(null, false);
    }
    catch (err) {
        return done(err, false);
    }
}));
export default passport;

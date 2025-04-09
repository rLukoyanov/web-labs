const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const { User } = require("../models/User");
const { BlacklistedToken } = require("../models/BlacklistedToken");

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET
};

passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
  try {
    // Получение токена 
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(this._req);
    // Проверяем, не в черном ли списке токен
    const isBlacklisted = await BlacklistedToken.findOne({ where: { token } });
    
    if (isBlacklisted) {
      return done(null, false);
    }
    // Поиск пользователя
    const user = await User.findByPk(jwtPayload.id);
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  } catch (err) {
    return done(err, false);
  }
}));

module.exports = passport;
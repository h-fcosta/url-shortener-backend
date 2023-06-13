// import passport from "passport";
// import { Strategy as JWTStrategy, ExtractJwt } from "passport-jwt";
// import User from "../models/User.js";

// const jwtOptions = {
//   jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//   secretOrKey: process.env.SECRET_JWT
// };

// async function jwtVerify(payload, done) {
//   try {
//     const user = await User.findById(payload.id);

//     if (user) {
//       return done(null, user);
//     } else {
//       return done(null, false);
//     }
//   } catch (error) {
//     return done(null, false);
//   }
// }

// passport.use(new JWTStrategy(jwtOptions, jwtVerify));

// export default passport;

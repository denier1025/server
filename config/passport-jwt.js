const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const mongoose = require("mongoose");
const User = mongoose.model("User");
const FrozenHistory = mongoose.model("FrozenHistory");
const keys = require("./keys");

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = keys.jwtSecretOrKey;

module.exports = passport => {
  passport.use(
    new JwtStrategy(opts, (jwt_payload, done) => {
      User.findById(jwt_payload.id)
        .then(user => {
          if (user) {
            if (user.frozen) {
              if (!(user.frozen.to < Date.now())) {
                done(null, false);
              } else {
                new FrozenHistory({
                  by: user.id,
                  frozen: {
                    user: user.id.toString(),
                    from: user.frozen.from,
                    to: user.frozen.to,
                    by: user.frozen.by,
                    description: user.frozen.description
                  }
                })
                  .save()
                  .then(() => {
                    User.update(
                      { _id: user.id },
                      {
                        $set: {
                          frozen: null
                        }
                      },
                      { new: true }
                    ).then(() => {
                      done(null, user);
                    });
                  });
              }
            } else {
              done(null, user);
            }
          } else {
            done(null, false);
          }
        })
        .catch(err => {
          if (err.name === "CastError") {
            done(null, false);
          } else {
            done(err);
          }
        });
    })
  );
};

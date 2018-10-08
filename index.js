/* ### Import mongoose and trying to connect to the mLab mongoDB server ### */
const keys = require("./config/keys");
require("mongoose")
  .connect(
    keys.mongoURI,
    { useNewUrlParser: true }
  )
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

/* ### Startpoint for import and creating an express server ### */
const app = require("express")();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* ### Import passport ### */
const passport = require("passport");

app.use(passport.initialize());

/* ### Mongoose models (ODM area) ### */
require("./models/User");
require("./models/Post");
require("./models/News")
require("./models/Comment")
require("./models/Image")
require("./models/history/user/parts/AvatarHistory");
require("./models/history/user/parts/EmailHistory");
require("./models/history/user/parts/FrozenHistory");
require("./models/history/user/parts/PasswordHistory");
require("./models/history/user/parts/PermissionHistory");
require("./models/history/user/parts/UsernameHistory");
require("./models/history/post/PostHistory");
require("./models/history/news/NewsHistory")
require("./models/history/comment/CommentHistory");
require("./models/history/image/ImageHistory");

/* ### JWT Passport strategy ### */
require("./config/passport-jwt")(passport);

/* ### API Routes ### */
app.use("/api/register", require("./routes/api/register"));
app.use("/api/login", require("./routes/api/login"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/news", require("./routes/api/news"));
app.use("/api", require("./routes/api/comments"));
app.use("/api", require("./routes/api/images"));

/* ### Running an express server ### */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
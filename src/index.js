const express = require("express");
const morgan = require("morgan");
const exphbs = require("express-handlebars");
const path = require("path");
const flash = require("connect-flash");
const session = require("express-session");
const MysqlStore = require("express-mysql-session");
const passport = require("passport");

const { database } = require("./key");
//inicializaciones ==> INITIALIZATION
const app = express();
require("./lib/passport");

//configuraciones ==> SETTINGS
app.set("port", process.env.PORT || 4000);
app.set("views", path.join(__dirname, "views"));
app.engine(
  ".hbs",
  exphbs({
    defaultLayout: "main",
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: ".hbs",
    helpers: require("./lib/handlebars"),
  })
);
app.set("view engine", "hbs");

//MIDDLEWARE
app.use(
  session({
    secret: "nodeappwithmysql",
    resave: false,
    saveUninitialized: false,
    store: new MysqlStore(database),
  })
);
app.use(flash());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());
//VARIBLE GLOBALES ==> GLOBAL VARIABLES
app.use((req, res, next) => {
  app.locals.success = req.flash("success");
  app.locals.message = req.flash("message");
  app.locals.user = req.user;
  next();
});
//RUTAS ==> ROUTES
app.use(require("./routes"));
app.use(require("./routes/authentication"));
app.use("/links", require("./routes/links"));
//archivos públicos ==> PUBLIC
app.use(express.static(path.join(__dirname, "public")));
//Empezar el servidor ==> STARTING THE SERVER
app.listen(app.get("port"), () => {
  console.log("Server on port ", app.get("port"));
});

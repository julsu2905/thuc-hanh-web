const express = require("express");
const path = require("path");
var session = require("express-session");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const multer = require("multer");
const cookieParser = require("cookie-parser");
const cors = require('cors');
const morgan = require('morgan');

const clientRouter = require("./routes/clientRoutes");
const adminRouter = require("./routes/adminRoutes");
const viewAdminRouter = require("./routes/viewAdminRoutes");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/appError");
const app = express();


app.enable("trust proxy");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(flash());

app.use(cors());
app.options('*', cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); 
app.use(express.json({ limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());
app.use(
	session({
		secret: "my secret",
		resave: false,
		saveUninitialized: false,
	})
);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

//ROUTES
app.use("/", clientRouter);
app.use("/admin/", viewAdminRouter);
app.use("/api/", adminRouter);

app.all("*", (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 4040;;
const mongoose = require("mongoose");
// const dbUrl = "mongodb://127.0.0.1:27017/assessmentbuddy";
const path = require("path");
const ejsMate = require("ejs-mate");
const OrderModel = require("./models/customer.js");
const session = require("express-session");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function main() {
  await mongoose.connect(process.env.dbUrl);
}
main().then(() => console.log("MongoDB Connected"))
      .catch(err => console.log(err));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// CUSTOMER SUCCESS CHECK
function checkOrderAccess(req, res, next) {
  if (req.session.orderSuccess) return next();
  return res.redirect("/");
}

// ADMIN CHECK
function checkAdmin(req, res, next) {
  if (req.session.isAdmin) return next();
  return res.redirect("/admin/login");
}

// ROUTES
app.get("/", (req, res) => {
  res.render("MainPage.ejs");
});

app.get("/success", checkOrderAccess, (req, res) => {
  res.render("success.ejs");
});

app.get("/privacy", (req, res) => {
  res.render("privacy.ejs");
});

// ADMIN LOGIN
app.get("/admin/login", (req, res) => {
  res.render("login.ejs");
});

app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect("/admin/orders");
  }
  res.send("Invalid credentials");
});

// ADMIN LOGOUT
app.get("/admin/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/admin/login");
  });
});

// ADMIN ORDERS PAGE
app.get("/admin/orders", checkAdmin, async (req, res) => {
  const orders = await OrderModel.find({});
  res.render("orders.ejs", { orders });
});

// DELETE ORDER
app.post("/admin/order/delete/:id", checkAdmin, async (req, res) => {
  await OrderModel.findByIdAndDelete(req.params.id);
  res.redirect("/admin/orders");
});

// EDIT ORDER PAGE
app.get("/admin/order/:id/edit", checkAdmin, async (req, res) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order) return res.redirect("/admin/orders");

  res.render("editOrder.ejs", { order });
});

// UPDATE ORDER
app.post("/admin/order/:id/edit", checkAdmin, async (req, res) => {
  const {
    studentName,
    whatsAppNumber,
    course,
    serviceType,
    topic,
    deadline,
    qualification,
    experience,
    certifications,
    specialization,
    additionalNotes,
    status,
    paymentStatus,
    price
  } = req.body;

  await OrderModel.findByIdAndUpdate(req.params.id, {
    studentName,
    whatsAppNumber,
    course,
    serviceType,
    topic,
    deadline: new Date(deadline),
    qualification,
    experience,
    certifications,
    specialization,
    additionalNotes,
    status,
    paymentStatus,
    price
  });

  res.redirect("/admin/orders");
});

// CUSTOMER ORDER SUBMIT
app.post("/order", async (req, res) => {
  try {
    const {
      studentName,
      whatsAppNumber,
      serviceType,
      course,
      topic,
      qualification,
      experience,
      certifications,
      specialization,
      deadline,
      additionalNotes,
      price
    } = req.body;

    // WhatsApp validation
    if (!/^\d{10}$/.test(whatsAppNumber)) {
      return res.status(400).send("Invalid WhatsApp number!");
    }

    // Topic validation (ppt + assessment only)
    if ((serviceType === "ppt" || serviceType === "assessment") && !topic) {
      return res.status(400).send("Topic/Title is required!");
    }

    const newOrder = new OrderModel({
      studentName,
      whatsAppNumber,
      serviceType,
      course,
      topic: topic || null,
      deadline: new Date(deadline),
      qualification,
      experience,
      certifications,
      specialization,
      additionalNotes,
      price
    });

    await newOrder.save();
    req.session.orderSuccess = true;

    res.redirect("/success");
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).send("Server Error! Something went wrong.");
  }
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});

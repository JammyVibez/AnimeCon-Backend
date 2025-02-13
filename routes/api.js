const express = require("express");

const messageRoute = require("./messages");
const conversationRoute = require("./conversations");
const userRoute = require("./users");
const authRoute = require("./auth");
const postRoute = require("./posts");
const searchRoute = require("./search");

const router = express.Router();

router.use("/messages", messageRoute);
router.use("/conversations", conversationRoute);
router.use("/users", userRoute);
router.use("/auth", authRoute);
router.use("/posts", postRoute);
router.use("/search", searchRoute);

module.exports = router;

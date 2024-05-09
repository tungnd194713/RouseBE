const express = require('express');
const multer  = require('multer')
const upload = multer()
const auth = require('../../middlewares/auth');
// const { validate } = require('../../models/course.model');

const router = express.Router();

module.exports = router;

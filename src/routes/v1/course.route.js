const express = require('express');
const courseController = require('../../controllers/course.controller');
// const { validate } = require('../../models/course.model');

const router = express.Router();

router.get('/', courseController.getCourse);

module.exports = router;

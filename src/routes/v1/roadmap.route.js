const express = require('express');
// const auth = require('../../middlewares/auth');
const roadmapController = require('../../controllers/roadmap.controller');
// const { validate } = require('../../models/course.model');

const router = express.Router();

router.post('/find-roadmap', roadmapController.findRoadMap);

module.exports = router;

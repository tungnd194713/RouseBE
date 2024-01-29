const express = require('express');
// const auth = require('../../middlewares/auth');
const roadmapController = require('../../controllers/roadmap.controller');
// const { validate } = require('../../models/course.model');

const router = express.Router();

router.post('/find-roadmap', roadmapController.findRoadMap);
router.post('/build-roadmap', roadmapController.buildRoadMap);
router.post('/seed-category', roadmapController.seedCategory);
router.post('/seed-milestone', roadmapController.seedMilestones);
router.post('/seed-roadmap', roadmapController.seedRoadmap);

module.exports = router;

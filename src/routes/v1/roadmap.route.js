const express = require('express');
const auth = require('../../middlewares/auth');
const roadmapController = require('../../controllers/roadmap.controller');
// const { validate } = require('../../models/course.model');

const router = express.Router();

router.get('/fetch-categories', roadmapController.fetchCategories);
router.get('/fetch-spec-categories', roadmapController.fetchSpecCategories);
router.post('/find-roadmap', roadmapController.findRoadMap);
router.post('/build-roadmap', roadmapController.buildRoadMap);
router.post('/apply-roadmap', roadmapController.applyRoadmap);
router.get('/get-user-roadmap', roadmapController.getUserRoadmap);
router.get('/get-milestone-module-progress/:milestone_id', roadmapController.getMilestoneModuleProgress);
router.post('/milestone/:milestone_id/complete', auth(), roadmapController.completeMilestone);
router.post('/seed-category', roadmapController.seedCategory);
router.post('/seed-milestone', roadmapController.seedMilestones);
router.post('/seed-roadmap', roadmapController.seedRoadmap);

module.exports = router;

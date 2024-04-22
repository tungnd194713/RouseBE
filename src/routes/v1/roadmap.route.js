const express = require('express');
const auth = require('../../middlewares/auth');
const multer  = require('multer')
const upload = multer()
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
router.post('/education-requests', auth(), roadmapController.getEducationRequests);
router.get('/education-requests/:jobEducationId', auth(), roadmapController.getEducationCourses);
router.get('/education-requests/:jobEducationId/courses/:courseId', auth(), roadmapController.getCourseDetail);
router.post('/education-requests/:jobEducationId/courses/create', upload.none(), auth(), roadmapController.createEducationCourse);
router.post('/education-requests/:jobEducationId/courses/:courseId', auth(), roadmapController.addExistingEducationCourse);
router.delete('/education-requests/:jobEducationId/courses/:courseId', auth(), roadmapController.removeCourseFromRoadmap);
router.post('/education-requests/:jobEducationId/courses/:courseId/modules/create', upload.none(), auth(), roadmapController.createEducationModule);
router.delete('/education-requests/:jobEducationId/courses/:courseId/modules/:moduleId', auth(), roadmapController.removeEducationModuleFromCourse);

module.exports = router;

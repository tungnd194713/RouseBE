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
router.get('/education-requests/:jobEducationId/check', auth(), roadmapController.checkEducationRoadmap);
router.get('/education-requests/:jobEducationId/send', auth(), roadmapController.sendEducationRoadmap);
router.get('/education-requests/:jobEducationId/courses/:courseId', auth(), roadmapController.getCourseDetail);
router.post('/education-requests/:jobEducationId/courses/create', upload.none(), auth(), roadmapController.createEducationCourse);
router.post('/education-requests/:jobEducationId/courses/:courseId', auth(), roadmapController.addExistingEducationCourse);
router.delete('/education-requests/:jobEducationId/courses/:courseId', auth(), roadmapController.removeCourseFromRoadmap);
// router.post('/education-requests/:jobEducationId/courses/:courseId/modules/create', upload.none(), auth(), roadmapController.createEducationModule);
router.delete('/education-requests/:jobEducationId/courses/:courseId/modules/:moduleId', auth(), roadmapController.removeEducationModuleFromCourse);
router.get('/education-requests/:jobEducationId/courses/:courseId/modules/:moduleId', auth(), roadmapController.getEducationModule);
router.put('/education-requests/:jobEducationId/courses/:courseId/modules/:moduleId', auth(), roadmapController.updateEducationModule);
router.post('/education-requests/instructor-list', auth(), roadmapController.getListInstructor);
router.post('/education-requests/:jobEducationId/instructor-courses/create', auth(), roadmapController.createInstructorCourse);
router.post('/education-requests/:jobEducationId/instructor-courses/', auth(), roadmapController.getListInstructorCourseByEducation);
router.post('/education-requests/instructor-courses/list', auth(), roadmapController.getListInstructorCourse);
router.post('/instructor-courses/:instructorCourseId/reviews/create', auth(), roadmapController.addReviewToInstructorCourse);
router.post('/instructor-courses/courses/:courseId/modules/create', upload.none(), auth(), roadmapController.createEducationModule);
router.post('/instructor-courses/courses/:courseId/tests/create', upload.none(), auth(), roadmapController.createNewTestToCourse);
router.delete('/instructor-courses/tests/:testId/', auth(), roadmapController.deleteTestById);
router.put('/instructor-courses/tests/:testId/', upload.none(), auth(), roadmapController.updateTestById);
router.get('/instructor-courses/tests/:testId/', auth(), roadmapController.getTestById);
router.post('/instructor-courses/tests/:testId/questions/create', upload.none(), auth(), roadmapController.createNewQuestionToTest);
router.delete('/instructor-courses/questions/:questionId', auth(), roadmapController.deleteQuestionById);
router.put('/instructor-courses/questions/:questionId', upload.none(), auth(), roadmapController.updateQuestionById);
router.put('/instructor-courses/:instructorCourseId/reviews/:reviewId', auth(), roadmapController.updateReviewOfInstructorCourse);
router.put('/instructor-courses/:instructorCourseId/update-status', auth(), roadmapController.updateInstructorCourseStatus);
router.get('/instructor-courses/:instructorCourseId/', auth(), roadmapController.getInstructorCourseById);
router.get('/instructor-courses/:instructorCourseId/sign-as-complete', auth(), roadmapController.signAsComplete);
router.get('/instructor-courses/:instructorCourseId/go-to-fix', auth(), roadmapController.goToFix);

module.exports = router;

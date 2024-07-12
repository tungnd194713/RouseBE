const express = require('express');
const auth = require('../../middlewares/auth');
const multer  = require('multer')
const upload = multer()
const courseController = require('../../controllers/course.controller');
const moduleController = require('../../controllers/module.controller');
// const { validate } = require('../../models/course.model');

const router = express.Router();

router.post('/module-log', auth(), moduleController.updateModuleLog);
router.get('/detail/:courseId', auth(), courseController.getCourse);
router.get('/detail/:courseId/modules/:moduleId', auth(), moduleController.getCourseModule);
router.post('/detail/:courseId/modules/', auth(), moduleController.createCourseModule);
router.delete('/detail/:courseId/modules/:moduleId', auth(), moduleController.removeCourseModule);
router.put('/detail/:courseId/modules/:moduleId', auth(), moduleController.updateCourseModule);
router.get('/applied-courses', auth(), courseController.getUserCourse);
router.post('/module/seed', moduleController.seedData);
router.post('/:moduleId/update-module-progress', courseController.updateModuleProgress);
router.get('/module/:module_id/note', auth(), moduleController.getNotes);
router.post('/module/:module_id/take-note', auth(), moduleController.takeNote);
router.post('/module/:module_id/edit-note', auth(), moduleController.editNote);
router.get('/module/:module_id/discussion', auth(), moduleController.getDiscussionByModule);
router.post('/module/:module_id/discussion/', auth(), moduleController.createDiscussion);
router.post('/module/:module_id/discussion/:discussion_id/reply', auth(), moduleController.replyDiscussion);
router.post('/module/:module_id/discussion/:discussion_id/toggle-upvote', auth(), moduleController.toggleUpvoteDiscussion);
router.get('/module/:module_id/exam', auth(), moduleController.getExam);
router.post('/module/:module_id/exam/:exam_id', auth(), moduleController.submitExam);
router.post('/', auth(), courseController.createCourse);
router.delete('/:courseId', auth('deleteCourse'), courseController.deleteCourse);
router.post('/list', auth(), courseController.getCourses);
router.post('/seed-learning-data/', auth(), courseController.seedLearningData);
router.post('/:courseId/add-module', auth(), courseController.addModuleToCourse);
router.post('/:courseId/', auth(), courseController.findCourseById);
router.put('/:courseId/', upload.none(), auth(), courseController.updateCourseInfo);
router.post('/transactions/list', auth(), courseController.getCourseTransactions);
// router.post('/module/:module_id/discussion/:discussion_id/reply', courseController.updateModuleProgress);
router.patch('/seed-course-module', courseController.seedModuleData);
router.patch('/seed-test-question', courseController.seedQuestionData);

module.exports = router;

const express = require('express');
const auth = require('../../middlewares/auth');
const courseController = require('../../controllers/course.controller');
const moduleController = require('../../controllers/module.controller');
// const { validate } = require('../../models/course.model');

const router = express.Router();

router.get('/', courseController.getCourse);
router.get('/applied-courses', auth(), courseController.getUserCourse);
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
// router.post('/module/:module_id/discussion/:discussion_id/reply', courseController.updateModuleProgress);

module.exports = router;

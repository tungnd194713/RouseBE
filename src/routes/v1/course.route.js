const express = require('express');
const courseController = require('../../controllers/course.controller');
const moduleController = require('../../controllers/module.controller');
// const { validate } = require('../../models/course.model');

const router = express.Router();

router.get('/', courseController.getCourse);
router.post('/:moduleId/update-module-progress', courseController.updateModuleProgress);
router.post('/module/:module_id/take-note', moduleController.takeNote);
router.post('/module/:module_id/discussion/', moduleController.createDiscussion);
router.post('/module/:module_id/discussion/:discussion_id/reply', moduleController.replyDiscussion);
// router.post('/module/:module_id/discussion/:discussion_id/reply', courseController.updateModuleProgress);

module.exports = router;

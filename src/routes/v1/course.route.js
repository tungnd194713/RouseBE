const express = require('express');
const courseController = require('../../controllers/course.controller');
// const { validate } = require('../../models/course.model');

const router = express.Router();

router.get('/', courseController.getCourse);
router.post('/:moduleId/update-module-progress', courseController.updateModuleProgress);

module.exports = router;

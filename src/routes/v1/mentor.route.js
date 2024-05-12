const express = require('express');
const multer  = require('multer')
const upload = multer()
const auth = require('../../middlewares/auth');
const { mentorController } = require('../../controllers');
// const { validate } = require('../../models/course.model');

const router = express.Router();

router.post('/profile/', auth(), mentorController.updateProfile);
router.post('/shifts/list', auth(), mentorController.getMentorShifts);
router.post('/find', auth(), mentorController.findMentor);

module.exports = router;

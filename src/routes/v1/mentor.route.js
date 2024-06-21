const express = require('express');
const multer  = require('multer')
const upload = multer()
const auth = require('../../middlewares/auth');
const { mentorController } = require('../../controllers');
const validate = require('../../middlewares/validate');

const router = express.Router();

router.get('/seed', auth(), mentorController.seedMentor);
router.get('/profile/', auth(), mentorController.getProfile);
router.post('/profile/', auth(), mentorController.updateProfile);
router.post('/shifts/list', auth(), mentorController.getMentorShifts);
router.post('/find', auth(), mentorController.findMentor);
router.get('/accept-shift/:mentorShiftId', auth(), mentorController.acceptMentorShift);
router.get('/reject-shift/:mentorShiftId', auth(), mentorController.rejectMentorShift);
router.get('/show-course/:courseId', auth(), mentorController.showCourse);
router.post('/update-shift/', auth(), mentorController.updateShift);
router.delete('/delete-shift/:weekday', auth(), mentorController.deleteShift);
router.post('/ratings/list', auth(), mentorController.getRatingList);

router.route('/list')
			.post(auth(), validate(), mentorController.getMentors);

module.exports = router;

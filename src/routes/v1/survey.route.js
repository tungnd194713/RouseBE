const express = require('express');
const auth = require('../../middlewares/auth');
const surveyController = require('../../controllers/survey.controller');
// const { validate } = require('../../models/course.model');

const router = express.Router();

router.post('/create-questions', surveyController.createQuestions);
router.post('/create-fuzzy', surveyController.createFuzzy);
router.get('/questions', auth(), surveyController.getSurveyQuestions);
router.post('/', auth(), surveyController.generateResult);

module.exports = router;

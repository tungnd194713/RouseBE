const httpStatus = require('http-status');
const { surveyService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const createQuestions = catchAsync(async (req, res) => {
  const questions = await surveyService.createQuestions();
  res.status(httpStatus.OK).send(questions);
});

const createFuzzy = catchAsync(async (req, res) => {
  const fuzzies = await surveyService.createFuzzy();
  res.status(httpStatus.OK).send(fuzzies);
});

const getSurveyQuestions = catchAsync(async (req, res) => {
  const result = await surveyService.getSurveyQuestions();
  res.status(httpStatus.OK).send(result);
});

const generateResult = catchAsync(async (req, res) => {
  const result = await surveyService.generateResult(req.body, req.user._id);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  createQuestions,
	createFuzzy,
	generateResult,
	getSurveyQuestions,
};

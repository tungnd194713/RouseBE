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

module.exports = {
  createQuestions,
	createFuzzy
};

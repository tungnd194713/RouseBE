const httpStatus = require('http-status');
const { surveyService, pollService } = require('../services');
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
  try {
		const result = await surveyService.getSurveyQuestions();
  	res.status(httpStatus.OK).send(result);
	} catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Something wrong');
	}
});

const generateResult = catchAsync(async (req, res) => {
  try {
		const result = await surveyService.generateResult(req.body, req.user._id);
  	res.status(httpStatus.OK).send(result);
	} catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Something wrong');
	}
});

const getPolllist = catchAsync(async (req, res) => {
  try {
		const result = await pollService.getPollList();
  	res.status(httpStatus.OK).send(result);
	} catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Something wrong');
	}
});

const getOptionUsers = catchAsync(async (req, res) => {
  try {
		const result = await pollService.getOptionUsers(req.params.option_id);
  	res.status(httpStatus.OK).send(result);
	} catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Something wrong');
	}
});

const vote = catchAsync(async (req, res) => {
  try {
		const result = await pollService.vote(req.params.option_id);
  	res.status(httpStatus.OK).send(result);
	} catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Something wrong');
	}
});

module.exports = {
  createQuestions,
	createFuzzy,
	generateResult,
	getSurveyQuestions,
	getPolllist,
	getOptionUsers,
	vote
};

const httpStatus = require('http-status');
const { roadmapService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const findRoadMap = catchAsync(async (req, res) => {
  const roadmap = await roadmapService.findRoadmap(req.params.category_id, req.params.sub_category_id, req.params.mastery);
  res.status(httpStatus.OK).send(roadmap);
});

const buildRoadMap = catchAsync(async (req, res) => {
  const roadmap = await roadmapService.buildRoadmap(req.body);
  if (!roadmap) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No roadmap built');
  }
  res.status(httpStatus.OK).send(roadmap);
});

const seedCategory = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.seedCategory();
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, e);
  }
});

const seedMilestones = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.seedMilestones();
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, e);
  }
});

const seedRoadmap = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.seedRoadmap();
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, e);
  }
});

module.exports = {
  findRoadMap,
  buildRoadMap,
  seedCategory,
  seedMilestones,
  seedRoadmap,
};

const httpStatus = require('http-status');
const { courseService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const getCourse = catchAsync(async (req, res) => {
  const courses = await courseService.getCourse();
  res.status(httpStatus.OK).send(courses);
});

const updateModuleProgress = catchAsync(async (req, res) => {
  const result = await courseService.updateModuleProgress(req.params.moduleId, req.body);
  res.status(httpStatus.OK).send(result);
});

const getUserCourse = catchAsync(async (req, res) => {
  const courses = await courseService.getUserCourse(req.user._id);
  res.status(httpStatus.OK).send(courses);
});

module.exports = {
  getCourse,
  updateModuleProgress,
  getUserCourse,
};

const httpStatus = require('http-status');
const { courseService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const getCourse = catchAsync(async (req, res) => {
  const courses = await courseService.getCourse(req.params.module_id, req.user._id);
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

const createCourse = catchAsync(async (req, res) => {
  const course = await courseService.createCourse(req.body);
  res.status(httpStatus.OK).send(course);
});

const updateCourseInfo = catchAsync(async (req, res) => {
  const course = await courseService.updateCourseInfo(req.params.courseId, req.body);
  res.status(httpStatus.OK).send(course);
});

const getCourses = catchAsync(async (req, res) => {
  const course = await courseService.getCourses(req.body, req.query);
  res.status(httpStatus.OK).send(course);
});

const addModuleToCourse = catchAsync(async (req, res) => {
  await courseService.addModuleToCourse(req.body, req.query);
  res.status(httpStatus.OK).send('Added');
});

const findCourseById = catchAsync(async (req, res) => {
  const course = await courseService.findCourseById(req.params.courseId);
  res.status(httpStatus.OK).send(course);
});

const getCourseTransactions = catchAsync(async (req, res) => {
  const course = await courseService.getCourseTransactions(req.query, req.body);
  res.status(httpStatus.OK).send(course);
});

const seedLearningData = catchAsync(async (req, res) => {
  const course = await courseService.seedLearningData();
  res.status(httpStatus.OK).send(course);
});

module.exports = {
  getCourse,
  updateModuleProgress,
  getUserCourse,
	createCourse,
	getCourses,
	addModuleToCourse,
	findCourseById,
	seedLearningData,
  updateCourseInfo,
	getCourseTransactions,
};

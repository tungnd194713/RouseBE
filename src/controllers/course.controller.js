const httpStatus = require('http-status');
const { courseService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const getCourse = catchAsync(async (req, res) => {
  const courses = await courseService.getCourse();
  res.status(httpStatus.OK).send(courses);
});

module.exports = {
  getCourse,
};

// const httpStatus = require('http-status');
const { Course } = require('../models');

const getCourse = async () => {
  const courses = await Course.find({});
  return courses;
};

module.exports = {
  getCourse,
};

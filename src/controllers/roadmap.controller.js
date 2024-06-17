const httpStatus = require('http-status');
const { roadmapService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { Instructor, User } = require('../models');

const fetchCategories = catchAsync(async (req, res) => {
  const roadmap = await roadmapService.fetchCategories();
  res.status(httpStatus.OK).send(roadmap);
});

const fetchSpecCategories = catchAsync(async (req, res) => {
  const roadmap = await roadmapService.fetchSpecCategories(req.query.category_id);
  res.status(httpStatus.OK).send(roadmap);
});

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

const applyRoadmap = catchAsync(async (req, res) => {
  try {
    await roadmapService.applyRoadmap(req.body);
    res.status(httpStatus.OK).send('Applied succeed');
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No roadmap applied');
  }
});

const getUserRoadmap = catchAsync(async (req, res) => {
  const roadmap = await roadmapService.getUserRoadmap(req.query.user_id);
  res.status(httpStatus.OK).send(roadmap);
});

const getMilestoneModuleProgress = catchAsync(async (req, res) => {
  const modules = await roadmapService.getMilestoneModuleProgress(req.params.milestone_id);
  res.status(httpStatus.OK).send(modules);
});

const completeMilestone = catchAsync(async (req, res) => {
  try {
    await roadmapService.completeMilestone(req.params.milestone_id, req.user._id);
    res.status(httpStatus.OK).send('Applied succeed');
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No milestone completed');
  }
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

const getPublishedEducations = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.getPublishedEducations(req.query, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, e);
  }
});

const getEducationRequests = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.getEducationRequests(req.query, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, e);
  }
});

const getEducationCourses = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.getEducationCourses(req.params.jobEducationId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, e);
  }
});

const getCourseDetail = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.getCourseDetail(req.params.jobEducationId, req.params.courseId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, e);
  }
});

const addExistingEducationCourse = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.addExistingEducationCourse(req.params.jobEducationId, req.params.courseId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, e);
  }
});

const createEducationCourse = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.createEducationCourse(req.params.jobEducationId, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, e);
  }
});

const removeCourseFromRoadmap = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.removeCourseFromRoadmap(req.params.jobEducationId, req.params.courseId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, e);
  }
});

const createEducationModule = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.createEducationModule(req.params.courseId, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const removeEducationModuleFromCourse = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.removeEducationModuleFromCourse(req.params.jobEducationId, req.params.courseId, req.params.moduleId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const getEducationModule = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.getEducationModule(req.params.jobEducationId, req.params.courseId, req.params.moduleId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const updateEducationModule = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.updateEducationModule(req.params.jobEducationId, req.params.courseId, req.params.moduleId, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const checkEducationRoadmap = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.checkEducationRoadmap(req.params.jobEducationId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const sendEducationRoadmap = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.sendEducationRoadmap(req.params.jobEducationId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const getListInstructor = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.getListInstructor(req.body, req.query);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const createInstructorCourse = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.createInstructorCourse(req.params.jobEducationId, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const getListInstructorCourse = catchAsync(async (req, res) => {
  const body = {...req.body}
  const user = await User.findById(req.user._id);
  if (user.role === 'instructor') {
    const instructor = await Instructor.findOne({ user: user._id || user.id });
    body.instructor = instructor.id || instructor._id;
  }
  try {
    const result = await roadmapService.getListInstructorCourse(body, req.query);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const getInstructorCourseById = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.getInstructorCourseById(req.user._id, req.params.instructorCourseId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const signAsComplete = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.signAsComplete(req.user._id, req.params.instructorCourseId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const goToFix = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.goToFix(req.user._id, req.params.instructorCourseId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const getListInstructorCourseByEducation = catchAsync(async (req, res) => {
  try {
    const body = {
      ...req.body,
      jobEducation: req.params.jobEducationId,
    }
    const result = await roadmapService.getListInstructorCourse(body, req.query);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const addReviewToInstructorCourse = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.addReviewToInstructorCourse(req.user._id, req.params.instructorCourseId, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const updateReviewOfInstructorCourse = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.updateReviewOfInstructorCourse(req.user._id, req.params.instructorCourseId, req.params.reviewId, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const createNewTestToCourse = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.createNewTestToCourse(req.params.courseId, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const createNewQuestionToTest = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.createNewQuestionToTest(req.params.testId, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const getTestById = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.getTestById(req.params.testId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const updateTestById = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.updateTestById(req.params.testId, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const deleteTestById = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.deleteTestById(req.params.testId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const updateQuestionById = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.updateQuestionById(req.params.questionId, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const deleteQuestionById = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.deleteQuestionById(req.params.questionId);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const updateInstructorCourseStatus = catchAsync(async (req, res) => {
  try {
    const result = await roadmapService.updateInstructorCourseStatus(req.params.instructorCourseId, req.body);
    res.status(httpStatus.OK).send(result);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

module.exports = {
  fetchCategories,
  fetchSpecCategories,
  findRoadMap,
  buildRoadMap,
  applyRoadmap,
  getUserRoadmap,
  getMilestoneModuleProgress,
  completeMilestone,
  seedCategory,
  seedMilestones,
  seedRoadmap,
	getPublishedEducations,
  getEducationRequests,
  getEducationCourses,
  getCourseDetail,
  addExistingEducationCourse,
  removeCourseFromRoadmap,
	createEducationModule,
	removeEducationModuleFromCourse,
	createEducationCourse,
  getEducationModule,
  updateEducationModule,
  checkEducationRoadmap,
  sendEducationRoadmap,
  getListInstructor,
  createInstructorCourse,
  getListInstructorCourse,
  addReviewToInstructorCourse,
  updateReviewOfInstructorCourse,
  updateInstructorCourseStatus,
  getListInstructorCourseByEducation,
  createNewTestToCourse,
  createNewQuestionToTest,
  getTestById,
  updateTestById,
  deleteTestById,
  updateQuestionById,
  deleteQuestionById,
  getInstructorCourseById,
  signAsComplete,
  goToFix,
};

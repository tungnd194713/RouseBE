const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, companyService, roadmapService } = require('../services');
const { UserRoadMap, Course } = require('../models');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user._id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.user._id, req.body);
  res.status(httpStatus.OK).send(user);
});

const uploadAvatar = catchAsync(async (req, res) => {
  const file = req.file;
  try {
    const user = await userService.getUserById(req.user._id);
    user.profile_image = file?.details.Location;
    await user.save();
    res.status(httpStatus.OK).send(file?.details.Location);
  } catch (e) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getUserProfile = catchAsync(async (req, res) => {
  const data = await userService.getUserProfile(req.user._id);
  res.status(httpStatus.OK).send(data);
});

const updateUserProfile = catchAsync(async (req, res) => {
  const data = await userService.updateUserProfile(req.user._id, req.body);
  res.status(httpStatus.OK).send(data);
});

const getUserOptions = catchAsync(async (req, res) => {
  const data = await companyService.getRequirementOptions(req.user._id);
  res.status(httpStatus.OK).send(data);
});

const getJobMatchingPoint = catchAsync(async (req, res) => {
  const data = await userService.jobMatchingPoint(req.user._id, req.params.jobId);
  res.status(httpStatus.OK).send(data);
});

const findJob = catchAsync(async (req, res) => {
  const data = await userService.findJob(req.body, req.query);
  res.status(httpStatus.OK).send(data);
});

const suggestJobs = catchAsync(async (req, res) => {
  const data = await userService.suggestJobs(req.user._id, req.body);
  res.status(httpStatus.OK).send(data);
});

const getDetailJob = catchAsync(async (req, res) => {
  const data = await userService.getDetailJob(req.user._id, req.params.jobId);
  res.status(httpStatus.OK).send(data);
});

const applyJob = catchAsync(async (req, res) => {
  const data = await userService.applyJob(req.user._id, req.body);
  res.status(httpStatus.OK).send(data);
});

const getAppliedJobs = catchAsync(async (req, res) => {
  const data = await userService.getAppliedJobs(req.user._id);
  res.status(httpStatus.OK).send(data);
});

const startJobEducation = catchAsync(async (req, res) => {
  const data = await userService.startJobEducation(req.user._id, req.params.candidateApplyId);
  res.status(httpStatus.OK).send(data);
});

const refuseJobEducation = catchAsync(async (req, res) => {
  const data = await userService.refuseJobEducation(req.user._id, req.params.candidateApplyId);
  res.status(httpStatus.OK).send(data);
});

const getCurrentEducation = catchAsync(async (req, res) => {
  const data = await userService.getCurrentEducation(req.user._id);
  res.status(httpStatus.OK).send(data);
});

const getUserModule = catchAsync(async (req, res) => {
  try {
    const data = await userService.getUserModule(req.user._id, req.params.courseId, req.params.moduleId);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const watchedModule = catchAsync(async (req, res) => {
  try {
    const data = await userService.watchedModule(req.user._id, req.params.courseId, req.params.moduleId);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const unlockRoadmapCourse = catchAsync(async (req, res) => {
  try {
    const data = await userService.unlockRoadmapCourse(req.user._id, req.params.courseId, req.body);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const requestMentor = catchAsync(async (req, res) => {
  try {
    const data = await userService.requestMentor(req.user._id, req.params.courseId, req.body);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const addMentorRating = catchAsync(async (req, res) => {
  try {
    const data = await userService.addMentorRating(req.user._id, req.body);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const getTestById = catchAsync(async (req, res) => {
  try {
    const userRoadmap = await UserRoadMap.findOne({ user: req.user._id, is_finished: false });

    if (!userRoadmap) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Roadmap not found');
    }

    const roadmapCourse = userRoadmap.roadmap_milestone?.find((item) => item.course.toString() === req.params.courseId.toString());

    if (!roadmapCourse || !roadmapCourse.is_unlocked) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
    }

    const course = await Course.findById(req.params.courseId);
    if (!course) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
    }
    let data = {};
    const test = await roadmapService.getTestById(req.params.testId);
    const answerSheet = await userService.getUserAnswerSheet(req.user._id, test.id);
    data.test = test;
    data.userRoadmap = userRoadmap;
    data.course = course;
    data.answerSheet = answerSheet;
    if (answerSheet.isFinished) {
      data.testKey = await userService.getTestKey(answerSheet.testId);
    }
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const getUserAnswerSheet = catchAsync(async (req, res) => {
  try {
    const data = await userService.getUserAnswerSheet(req.user._id, req.params.courseId, req.params.testId);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const createAnswerSheet = catchAsync(async (req, res) => {
  try {
    const data = await userService.createAnswerSheet(req.user._id, req.params.testId, req.body);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const updateAnswerSheetById = catchAsync(async (req, res) => {
  try {
    const data = await userService.updateAnswerSheetById(req.params.answerSheetId, req.body);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const getAnswerSheetById = catchAsync(async (req, res) => {
  try {
    const data = await userService.getAnswerSheetById(req.params.answerSheetId);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const submitAnswerSheet = catchAsync(async (req, res) => {
  try {
    const data = await userService.submitAnswerSheet(req.user._id, req.params.courseId, req.params.answerSheetId, req.body);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const getUserRoadmapList = catchAsync(async (req, res) => {
  try {
    const data = await userService.getUserRoadmapList(req.user._id);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

const getRoadmapDetail = catchAsync(async (req, res) => {
  try {
    const data = await userService.getRoadmapDetail(req.user._id, req.params.roadmapId);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserProfile,
  getUserOptions,
  updateUserProfile,
	getJobMatchingPoint,
  findJob,
  suggestJobs,
	getDetailJob,
  applyJob,
  getAppliedJobs,
  startJobEducation,
  getCurrentEducation,
  getUserModule,
  watchedModule,
	unlockRoadmapCourse,
  requestMentor,
  addMentorRating,
  getUserAnswerSheet,
  createAnswerSheet,
  updateAnswerSheetById,
  getAnswerSheetById,
  submitAnswerSheet,
  getTestById,
  uploadAvatar,
  getUserRoadmapList,
  getRoadmapDetail,
  refuseJobEducation,
};

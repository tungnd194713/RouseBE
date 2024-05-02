const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService, companyService } = require('../services');

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
  const data = await userService.suggestJobs(req.user._id);
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
  watchedModule
};

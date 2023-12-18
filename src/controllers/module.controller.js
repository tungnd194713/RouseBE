const httpStatus = require('http-status');
const { moduleService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const getNotes = catchAsync(async (req, res) => {
  const note = await moduleService.getNotes(req.params.module_id, req.user.id);
  res.status(httpStatus.OK).send(note);
});

const takeNote = catchAsync(async (req, res) => {
  const note = await moduleService.takeNote(req.params.module_id, req.user.id, req.body);
  res.status(httpStatus.OK).send(note);
});

const editNote = catchAsync(async (req, res) => {
  const note = await moduleService.editNote(req.params.module_id, req.user.id, req.body);
  res.status(httpStatus.OK).send(note);
});

const createDiscussion = catchAsync(async (req, res) => {
  const result = await moduleService.createDiscussion(req.params.module_id, req.user._id, req.body);
  res.status(httpStatus.OK).send(result);
});

const replyDiscussion = catchAsync(async (req, res) => {
  const result = await moduleService.replyDiscussion(req.params.module_id, req.user._id, req.params.discussion_id, req.body);
  res.status(httpStatus.OK).send(result);
});

const getDiscussionByModule = catchAsync(async (req, res) => {
  const result = await moduleService.getDiscussionByModule(req.params.module_id);
  res.status(httpStatus.OK).send(result);
});

const toggleUpvoteDiscussion = catchAsync(async (req, res) => {
  const result = await moduleService.replyDiscussion(req.body.is_discussion, req.body.id, req.user._id);
  res.status(httpStatus.OK).send(result);
});

const getExam = catchAsync(async (req, res) => {
  const result = await moduleService.getExam(req.user._id, req.params.module_id);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Exam not found');
  }
  res.status(httpStatus.OK).send(result);
});

const submitExam = catchAsync(async (req, res) => {
  const result = await moduleService.submitExam(req.user._id, req.params.exam_id, req.body);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Exam not found');
  }
  res.status(httpStatus.OK).send(result);
});

const seedData = catchAsync(async (req, res) => {
  const result = await moduleService.seedData();
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Exam not found');
  }
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  getNotes,
  takeNote,
  editNote,
  getDiscussionByModule,
  createDiscussion,
  replyDiscussion,
  toggleUpvoteDiscussion,
  getExam,
  submitExam,
  seedData,
};

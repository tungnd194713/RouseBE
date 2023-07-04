const httpStatus = require('http-status');
const { moduleServiceService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const takeNote = catchAsync(async (req, res) => {
  const note = await moduleServiceService.takeNote(req.params.module_id, req.user._id, req.body);
  res.status(httpStatus.OK).send(note);
});

const createDiscussion = catchAsync(async (req, res) => {
  const result = await moduleServiceService.createDiscussion(req.params.module_id, req.user._id, req.body);
  res.status(httpStatus.OK).send(result);
});

const replyDiscussion = catchAsync(async (req, res) => {
  const result = await moduleServiceService.replyDiscussion(
    req.params.module_id,
    req.user._id,
    req.params.discussion_id,
    req.body
  );
  res.status(httpStatus.OK).send(result);
});

const toggleUpvoteDiscussion = catchAsync(async (req, res) => {
  const result = await moduleServiceService.replyDiscussion(req.body.is_discussion, req.body.id, req.user._id);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  takeNote,
  createDiscussion,
  replyDiscussion,
  toggleUpvoteDiscussion,
};

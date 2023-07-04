/* eslint-disable camelcase */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Discussion, DiscussionReply, Note } = require('../models');

const takeNote = async (module_id, user_id, body) => {
  const previousNote = await Note.find({
    module_id,
    user_id,
    noted_video_time: body.noted_video_time,
  });
  if (previousNote) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Note taken');
  }
  return Note.create({ ...body, module_id, user_id });
};

const createDiscussion = async (module_id, user_id, body) => {
  return Discussion.create({ ...body, module_id, user_id });
};

const replyDiscussion = async (module_id, user_id, discussion_id, body) => {
  return DiscussionReply.create({ ...body, module_id, user_id, discussion_id });
};

const toggleUpvoteDiscussion = async (is_discussion, id, user_id) => {
  const model = is_discussion ? Discussion.findById(id) : DiscussionReply.findById(id);
  const upvoted_by = [...model.upvoted_by];
  const index = upvoted_by.indexOf(user_id);
  if (index > -1) {
    upvoted_by.splice(index, 1);
  } else {
    upvoted_by.push(user_id);
  }
  Object.assign(model, { upvoted_by });
  await model.save();
  return model;
};

module.exports = {
  takeNote,
  createDiscussion,
  replyDiscussion,
  toggleUpvoteDiscussion,
};

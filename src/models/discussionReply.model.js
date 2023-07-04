const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const discussionReplySchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    module_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Module',
      required: true,
    },
    discussion_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Discussion',
      required: true,
    },
    content: {
      type: String,
    },
    upvoted_by: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
discussionReplySchema.plugin(toJSON);

/**
 * @typedef Discussion
 */
const DiscussionReply = mongoose.model('DiscussionReply', discussionReplySchema);

module.exports = DiscussionReply;

const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const discussionSchema = mongoose.Schema(
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
    title: {
      type: String,
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
    noted_video_time: {
      type: Number,
    },
    discussionReplies: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'DiscussionReply',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
discussionSchema.plugin(toJSON);

/**
 * @typedef Discussion
 */
const Discussion = mongoose.model('Discussion', discussionSchema);

module.exports = Discussion;

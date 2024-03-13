const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const pollOptionSchema = mongoose.Schema(
  {
    chosen_users: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
    }],
		poll_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Poll',
		},
    title: {
			type: String,
			required: true,
			trim: true,
		},
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
pollOptionSchema.plugin(toJSON);

/**
 * @typedef Poll
 */
const PollOption = mongoose.model('PollOption', pollOptionSchema);

module.exports = PollOption;

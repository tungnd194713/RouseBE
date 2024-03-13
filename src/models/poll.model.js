const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const pollSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
			type: String,
			required: true,
			trim: true,
		},
    description: {
			type: String,
			required: true,
			trim: true,
		},
    is_multiple_choice: {
			type: Boolean,
		},
		expire_time: {
			type: Date,
			required: true,
		},
		options: [
			{
				type: mongoose.SchemaTypes.ObjectId,
				ref: 'PollOption'
			}
		]
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
pollSchema.plugin(toJSON);

/**
 * @typedef Poll
 */
const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;

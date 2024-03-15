const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const collegeSchema = mongoose.Schema(
  {
    field: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'CareerField',
    },
    name: {
			type: String,
			required: true,
		},
		related_point: {
			type: Number,
			default: 1, // 0, 0.5, 1
		}
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
collegeSchema.plugin(toJSON);

/**
 * @typedef Note
 */
const College = mongoose.model('College', collegeSchema);

module.exports = College;

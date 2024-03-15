const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const majorSchema = mongoose.Schema(
  {
    name: {
			type: String,
			required: true,
		},
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
majorSchema.plugin(toJSON);

/**
 * @typedef Note
 */
const Major = mongoose.model('Major', majorSchema);

module.exports = Major;

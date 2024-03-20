const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const subjectSchema = mongoose.Schema(
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
subjectSchema.plugin(toJSON);

/**
 * @typedef Note
 */
const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
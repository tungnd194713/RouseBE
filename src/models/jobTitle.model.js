const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const jobTitleSchema = mongoose.Schema(
  {
    field: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'CareerField',
    },
    title: {
			type: String,
			required: true,
		},
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
jobTitleSchema.plugin(toJSON);

/**
 * @typedef Note
 */
const JobTitle = mongoose.model('JobTitle', jobTitleSchema, 'job_title');

module.exports = JobTitle;

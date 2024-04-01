const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const jobEducationSchema = mongoose.Schema(
  {
    job: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Job',
      required: true,
    },
    company: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Company',
      required: true,
    },
    max_education_month: {
      type: Number,
      required: true,
    },
		scholarship: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
jobEducationSchema.plugin(toJSON);

/**
 * @typedef JobEducation
 */
const JobEducation = mongoose.model('JobEducation', jobEducationSchema);

module.exports = JobEducation;

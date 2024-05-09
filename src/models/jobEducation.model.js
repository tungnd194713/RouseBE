const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

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
		number_trainings: {
			type: Number,
			required: true,
		},
    status: {
      type: Number,
      enum: [1, 2, 3, 4],
      default: 1,
    },
		scholarship_paid: {
			type: Boolean,
			default: false,
		},
    courses: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Course',
    }],
    change_requests: [
      {
        content: {
          type: String,
          required: true,
        },
        requested_date: {
          type: Date,
          default: Date.now(),
        },
        is_read: {
          type: Boolean,
          default: false
        },
      }
    ]
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
jobEducationSchema.plugin(toJSON);
jobEducationSchema.plugin(paginate);

/**
 * @typedef JobEducation
 */
const JobEducation = mongoose.model('JobEducation', jobEducationSchema);

module.exports = JobEducation;

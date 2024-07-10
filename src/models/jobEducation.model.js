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
    custom_requirement: {
      type: String,
    },
    status: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
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
        title: {
          type: String,
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        requested_date: {
          type: Date,
          default: Date.now(),
        },
        status: {
          type: Number,
          default: 0,
          enum: [0, 1, 2],
        },
        replied_date: {
          type: Date,
        }
      }
    ],
		published_at: {
			type: Date,
		}
  },
  {
    timestamps: true,
  }
);

jobEducationSchema.virtual('userRoadmaps', {
  ref: 'UserRoadmap',
  localField: '_id',
  foreignField: 'jobEducation',
});

// add plugin that converts mongoose to json
jobEducationSchema.plugin(toJSON);
jobEducationSchema.plugin(paginate);

/**
 * @typedef JobEducation
 */
const JobEducation = mongoose.model('JobEducation', jobEducationSchema);

module.exports = JobEducation;

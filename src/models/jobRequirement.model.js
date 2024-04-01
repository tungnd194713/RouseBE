const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const jobRequirementSchema = mongoose.Schema(
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
    type: {
      type: String,
      required: true,
      enum: ['Skill', 'Certificate', 'Major'],
    },
    skills: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Subject',
    }],
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    certificates: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Certificate',
    }],
    majors: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Major',
    }],
    colleges: [{
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'College',
    }],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
jobRequirementSchema.plugin(toJSON);
jobRequirementSchema.plugin(paginate);

/**
 * @typedef JobRequirement
 */
const JobRequirement = mongoose.model('JobRequirement', jobRequirementSchema);

module.exports = JobRequirement;

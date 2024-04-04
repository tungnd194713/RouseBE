const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const collegeSubjectsSchema = mongoose.Schema(
  {
    college: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'College',
      default: mongoose.Types.ObjectId('000000000000'),
    },
		major: {
			type: mongoose.SchemaTypes.ObjectId,
      ref: 'Major',
      required: true,
		},
    subject_objects: [{
			subject: {
				type: mongoose.SchemaTypes.ObjectId,
				ref: 'Subject'
			},
      level: {
        type: String,
        default: 'Beginner',
        enum: ['Beginner', 'Intermediate', 'Advanced'],
      }
		}],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
collegeSubjectsSchema.plugin(toJSON);

/**
 * @typedef Note
 */
const CollegeSubjects = mongoose.model('CollegeSubjects', collegeSubjectsSchema);

module.exports = CollegeSubjects;

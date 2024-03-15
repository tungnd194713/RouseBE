const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const collegeSubjectsSchema = mongoose.Schema(
  {
    college: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'College',
    },
		major: {
			type: mongoose.SchemaTypes.ObjectId,
      ref: 'Major',
		},
    subject_objects: [{
			subject: {
				type: mongoose.SchemaTypes.ObjectId,
				ref: 'Subject'
			},
			level: {
				level: {
					type: String,
					default: 'Beginner',
					enum: ['Beginner', 'Intermediate', 'Advanced'],
				}
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

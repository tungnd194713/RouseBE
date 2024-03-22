const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const certificateSubjectsSchema = mongoose.Schema(
  {
    certificate: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Certificate',
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
certificateSubjectsSchema.plugin(toJSON);

/**
 * @typedef Note
 */
const CertificateSubjects = mongoose.model('CertificateSubjects', certificateSubjectsSchema);

module.exports = CertificateSubjects;

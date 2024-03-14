const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const subjectSchema = mongoose.Schema(
  {
    field: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'CareerField',
      required: true,
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
subjectSchema.plugin(toJSON);

/**
 * @typedef Note
 */
const Subject = mongoose.model('Note', subjectSchema);

module.exports = Subject;

const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const collegeSchema = mongoose.Schema(
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
collegeSchema.plugin(toJSON);

/**
 * @typedef Note
 */
const College = mongoose.model('Note', collegeSchema);

module.exports = College;

const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const certificateSchema = mongoose.Schema(
  {
    field: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'CareerField',
    },
    name: {
			type: String,
			required: true,
		},
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
certificateSchema.plugin(toJSON);

/**
 * @typedef Note
 */
const Certificate = mongoose.model('Certificate', certificateSchema);

module.exports = Certificate;
const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const certificateSchema = mongoose.Schema(
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
certificateSchema.plugin(toJSON);

/**
 * @typedef Note
 */
const Certificate = mongoose.model('Note', certificateSchema);

module.exports = Certificate;

const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const fieldRankingSchema = mongoose.Schema(
  {
    field: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'CareerField',
      required: true,
    },
    collection_type: {
      type: String,
			required: true,
			enum: ['certificate', 'subject', 'college']
    },
    certificate: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Certificate',
    },
		subject: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Subject',
    },
		college: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'College',
    },
		point: {
			type: Number,
			default: 0,
		}
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
fieldRankingSchema.plugin(toJSON);

/**
 * @typedef Note
 */
const FieldRanking = mongoose.model('Note', fieldRankingSchema);

module.exports = FieldRanking;

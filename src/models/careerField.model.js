const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const careerFieldSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
careerFieldSchema.plugin(toJSON);
careerFieldSchema.plugin(paginate);
/**
 * @typedef CareerField
 */
const CareerField = mongoose.model('CareerField', careerFieldSchema);

module.exports = CareerField;

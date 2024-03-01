const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const surveyOptionSchema = mongoose.Schema(
  {
    label: {
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
surveyOptionSchema.plugin(toJSON);
surveyOptionSchema.plugin(paginate);
/**
 * @typedef SurveyOption
 */
const SurveyOption = mongoose.model('SurveyOption', surveyOptionSchema);

module.exports = SurveyOption;

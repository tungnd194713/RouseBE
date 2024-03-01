const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const surveyQuestionSchema = mongoose.Schema(
  {
    label: {
      type: String,
      trim: true,
      required: true,
    },
		type: {
			type: String,
			enum: ['Query', 'Fuzzy'],
		},
		content: {
			type: String,
		},
    options: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SurveyOption',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
surveyQuestionSchema.plugin(toJSON);
surveyQuestionSchema.plugin(paginate);
/**
 * @typedef SurveyQuestion
 */
const SurveyQuestion = mongoose.model('SurveyQuestion', surveyQuestionSchema);

module.exports = SurveyQuestion;

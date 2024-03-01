const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const surveyFuzzySchema = new Schema({
  question_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  field_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  option_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  fuzzy_value: {
    type: Number,
    required: true,
		default: 0,
  },
  weight: {
    type: Number,
		default: 1,
  }
});

surveyFuzzySchema.plugin(toJSON);
surveyFuzzySchema.plugin(paginate);

const SurveyFuzzy = mongoose.model('SurveyFuzzy', surveyFuzzySchema);

module.exports = SurveyFuzzy;
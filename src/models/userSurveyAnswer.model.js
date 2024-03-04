const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const { Schema } = mongoose;

const userSurveyAnswerSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  survey_answers: [{
    question_id: {
      type: Schema.Types.ObjectId,
    },
    option_id: [
			{
				type: Schema.Types.ObjectId,
			}
		]
  }]
});

userSurveyAnswerSchema.plugin(toJSON);
userSurveyAnswerSchema.plugin(paginate);

const UserSurveyAnswer = mongoose.model('UserSurveyAnswers', userSurveyAnswerSchema, 'user_survey_answers');

module.exports = UserSurveyAnswer;
const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const candidateApplySchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cv_type: {
    type: Number,
    required: true,
    default: 1,
    enum: [1, 2],
  },
  message: String,
  status: {
    type: Number,
    required: true,
    default: 1,
    enum: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  note: String,
  read: {
    type: Number,
    required: true,
    default: 0,
    enum: [0, 1],
  },
  is_first_apply: {
    type: Boolean,
    required: true,
    default: false,
  },
  matching_point: {
    type: Number,
  },
	education_applied: {
    type: Number,
    required: true,
    default: 0,
    enum: [0, 1],
  },
	education_courses: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Course'
		}
	]
}, {
  timestamps: true,
});

candidateApplySchema.plugin(toJSON);
candidateApplySchema.plugin(paginate);

const CandidateApply = mongoose.model('CandidateApply', candidateApplySchema);

module.exports = CandidateApply;

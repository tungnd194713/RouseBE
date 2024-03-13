const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const candidateApplySchema = new mongoose.Schema({
  job_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  user_id: {
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
    enum: [1, 2, 3, 4, 5, 6],
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
}, {
  timestamps: true,
});

candidateApplySchema.plugin(toJSON);
candidateApplySchema.plugin(paginate);

const CandidateApply = mongoose.model('CandidateApply', candidateApplySchema);

module.exports = CandidateApply;
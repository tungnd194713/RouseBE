const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const jobSchema = new mongoose.Schema({
  company_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  // title_vi: {
  //   type: String,
  //   required: true,
  // },
  form_recruitment: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5],
  },
  date_start: {
    type: Date,
    required: true,
  },
  // date_end: {
  //   type: Date,
  //   required: true,
  // },
  display_month: {
    type: Number,
    required: true,
  },
  number_recruitments: {
    type: Number,
    required: true,
  },
  status_stay: {
    type: String,
    required: true,
  },
  salary_min: {
    type: Number,
    required: true,
  },
  salary_max: {
    type: Number,
    required: true,
  },
  content_work: {
    type: String,
    required: true,
  },
  conditions_apply: {
    type: String,
    required: true,
  },
  province_id: Number,
  district: String,
  career: Number,
  address_work: String,
  time_work: String,
  holidays: String,
  welfare_regime: String,
  overtime: String,
  break_time: String,
  // type_plan: {
  //   type: Number,
  //   required: true,
  //   enum: [1, 2, 3],
  // },
  // order_job: {
  //   type: Number,
  //   required: true,
  // },
  image_job: String,
  default_image: String,
  translate_vi: String,
  status: {
    type: Number,
    default: 1,
    enum: [0, 1],
  },
  read: {
    type: Number,
    default: 0,
    enum: [0, 1],
  },
  slug: {
    type: String,
    required: true,
  },
  // draft: {
  //   type: Number,
  //   required: true,
  //   enum: [0, 1],
  // },
  postal_code: String,
  hour_work: {
    type: Number,
  },
  number_work_day_min: {
    type: Number,
  },
  number_work_day_max: {
    type: Number,
  },
  overtime_min: Number,
  overtime_max: Number,
  holiday_min: Number,
  holiday_max: Number,
  night_work_min: Number,
  night_work_max: Number,
  overtime_coefficients: {
    type: Number,
  },
  holiday_coefficients: {
    type: Number,
  },
  night_work_coefficients: {
    type: Number,
  },
  price_job: Number,
  price_apply: Number,
  confirm_price_status: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3],
  },
	candidate_applied: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'CandidateApply',
	}],
  deleted_at: Date,
}, {
  timestamps: true,
});

// add plugin that converts mongoose to json
jobSchema.plugin(toJSON);
jobSchema.plugin(paginate);

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
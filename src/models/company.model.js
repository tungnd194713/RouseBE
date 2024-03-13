const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');

const companySchema = new mongoose.Schema({
  company_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  login_type: {
    type: Number,
    default: 0,
    enum: [0, 1],
  },
  facebook_id: String,
  manager_name: String,
  address: String,
  profile_image: String,
  logo: String,
  phone: String,
  description: String,
  description_vi: String,
  founded_year: Date,
  link_website: String,
  link_facebook: String,
  page_id: String,
  number_members: Number,
  login_at: Date,
  email_verified_at: Date,
  payment_customer_id: String,
  postal_code: String,
  province_id: {
    type: Number,
    default: 1,
  },
  district: String,
  video_link: String,
  remember_token: String,
  status: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3],
  },
  previous_status: Number,
  reason_deletion: String,
}, {
  timestamps: true,
});

/**
 * Check if email is taken
 * @param {string} email - The company's email
 * @param {ObjectId} [excludeUserId] - The id of the company to be excluded
 * @returns {Promise<boolean>}
 */
companySchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const company = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!company;
};

/**
 * Check if password matches the company's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
companySchema.methods.isPasswordMatch = async function (password) {
  const company = this;
  return bcrypt.compare(password, company.password);
};

companySchema.pre('save', async function (next) {
  const company = this;
  if (company.isModified('password')) {
    company.password = await bcrypt.hash(company.password, 8);
  }
  next();
});

// add plugin that converts mongoose to json
companySchema.plugin(toJSON);
companySchema.plugin(paginate);
/**
 * @typedef Company
 */
const Company = mongoose.model('Company', companySchema);

module.exports = Company;

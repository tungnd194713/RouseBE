const mongoose = require('mongoose');

const { Schema } = mongoose;

const userProfileSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  skills: [{
    skill: { type: Schema.Types.ObjectId, ref: 'Subject' },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
    custom_skill: { type: String }
  }],
  educations: [{
    college: { type: Schema.Types.ObjectId, ref: 'College' },
    major: { type: Schema.Types.ObjectId, ref: 'Major' },
    start_at: { type: Date },
    end_at: { type: Date },
    custom_college: { type: String },
    custom_major: { type: String },
    is_custom_college: { type: Boolean },
    is_custom_major: { type: Boolean },
    status: {
      type: Number
    }
  }],
  certificates: [{
    certificate: { type: Schema.Types.ObjectId, ref: 'Certificate' },
    receive_at: { type: Date },
    custom_certificate: { type: String },
    is_custom_certificate: { type: Boolean },
  }],
  working_experiences: [{
    name: { type: String },
		position: { type: String },
    start_at: { type: Date },
    end_at: { type: Date },
    status: {
      type: Number
    }
  }],
  introduction: { type: String },
  strength: { type: String },
  reason_apply: { type: String },
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;

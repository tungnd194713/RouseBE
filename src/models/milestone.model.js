const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const milestoneSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      required: true,
    },
    estimated_time: {
      name: String, // "3 weeks"
      value: Number, // 504 (hours)
    },
    experience_level: [
      {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
      },
    ],
    skill_set: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SkillSet',
      },
    ],
    main_goal: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MainGoal',
      },
    ],
    specific_goal: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SpecificGoal',
      },
    ],
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
      },
    ],
    prerequisite_milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
    },
    base_milestone_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
milestoneSchema.plugin(toJSON);
milestoneSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
// userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
//   const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
//   return !!user;
// };

// /**
//  * Check if password matches the user's password
//  * @param {string} password
//  * @returns {Promise<boolean>}
//  */
// userSchema.methods.isPasswordMatch = async function (password) {
//   const user = this;
//   return bcrypt.compare(password, user.password);
// };

// userSchema.pre('save', async function (next) {
//   const user = this;
//   if (user.isModified('password')) {
//     user.password = await bcrypt.hash(user.password, 8);
//   }
//   next();
// });

/**
 * @typedef Milestone
 */
const Milestone = mongoose.model('Milestone', milestoneSchema);

module.exports = Milestone;

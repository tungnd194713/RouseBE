const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const courseSchema = mongoose.Schema(
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
		thumbnail: {
      type: String,
      trim: true,
    },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
		skill_tags: [{
			skill: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'Subject',
			},
			level: {
				type: String,
				enum: ['Beginner', 'Intermediate', 'Advanced']
			}
		}]
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
courseSchema.plugin(toJSON);
courseSchema.plugin(paginate);

/**
 * @typedef Course
 */
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;

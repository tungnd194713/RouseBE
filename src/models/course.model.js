const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const courseSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
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

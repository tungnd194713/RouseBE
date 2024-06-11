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
		}],
    point_cost: {
      type: Number,
      default: 100,
    },
    estimated_time: {
      type: Number,
      required: true,
    },
    tests: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Test"
    }],
		in_charge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
		},
  },
  {
    timestamps: true,
    toObject: { getters: true, setters: true, virtual: true },
    toJSON: { getters: true, setters: true, virtual: true },
  }
);

// add plugin that converts mongoose to json
courseSchema.plugin(toJSON);
courseSchema.plugin(paginate);

courseSchema.virtual('instructorCourse', {
  ref: 'InstructorCourse',
  localField: '_id',
  foreignField: 'course',
  justOne: true,
});

/**
 * @typedef Course
 */
const Course = mongoose.model('Course', courseSchema);

module.exports = Course;

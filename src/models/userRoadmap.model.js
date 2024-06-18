const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const userRoadmapSchema = mongoose.Schema(
  {
    title: {
      // Junior frontend developer
      type: String,
      trim: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
		jobEducation: {
			type: mongoose.Schema.Types.ObjectId,
      ref: 'JobEducation',
      required: true,
		},
    description: {
      // HOw to become a frontend dev
      type: String,
      trim: true,
    },
    current_course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      // required: true,
    },
    current_module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      // required: true,
    },
		scholarship: {
			type: Number,
		},
    roadmap_milestone: [
      {
        course: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Course',
        },
        is_skipped: {
          type: Boolean,
          default: false,
        },
        skippable: {
          type: Boolean,
          default: true,
        },
        progress: {
          type: Number,
          default: 0,
        },
        is_finished: {
          type: Boolean,
          default: false,
        },
        done_modules: [{
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Module',
        }],
        finished_date: Date,
				is_unlocked: {
					type: Boolean,
					default: false,
				},
      },
    ],
		done_courses: [{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Course',
		}],
    progress: {
      type: Number,
      default: 0,
    },
    applied_date: Date,
    is_finished: {
      type: Boolean,
      default: false,
    },
    finished_date: Date,
  },
  {
    timestamps: true,
  }
);

userRoadmapSchema.plugin(toJSON);
userRoadmapSchema.plugin(paginate);

const UserRoadmap = mongoose.model('UserRoadmap', userRoadmapSchema, 'user_roadmaps');

module.exports = UserRoadmap;

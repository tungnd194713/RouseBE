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
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    description: {
      // HOw to become a frontend dev
      type: String,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    subCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    base_milestone: [
      {
        title: String,
        order: Number,
      },
    ],
    current_milestone: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      // required: true,
    },
    current_module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Module',
      // required: true,
    },
    roadmap_milestone: [
      {
        milestone: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Milestone',
        },
        is_skipped: {
          type: Boolean,
          required: true,
          default: false,
        },
        skippable: {
          type: Boolean,
          required: true,
          default: true,
        },
        progress: {
          type: Number,
          required: true,
          default: 0,
        },
        modules: [
          {
            module_id: mongoose.Schema.Types.ObjectId,
            video_played_time: {
              type: Number,
              default: 0,
            },
            quizzes_answered: [
              {
                quizz_id: mongoose.SchemaTypes.ObjectId,
                chosen_answer: Number,
                is_correct: Boolean,
                is_answered: Boolean,
                answered_at: Date,
              },
            ],
            progress: {
              type: Number,
              default: 0,
            },
            is_finished: {
              type: Boolean,
              default: false,
            },
            finished_date: Date,
          },
        ],
        is_finished: {
          type: Boolean,
          required: true,
          default: false,
        },
        finished_date: Date,
      },
    ],
    applied_date: Date,
    is_finished: {
      type: Boolean,
      required: true,
      default: false,
    },
    finished_date: Date,
    roadmap_info: {
      estimated_time: {
        type: Number,
      },
      experience_level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
      },
      skill_set: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'SkillSet',
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

userRoadmapSchema.plugin(toJSON);
userRoadmapSchema.plugin(paginate);

const UserRoadmap = mongoose.model('UserRoadmap', userRoadmapSchema, 'user_roadmaps');

module.exports = UserRoadmap;

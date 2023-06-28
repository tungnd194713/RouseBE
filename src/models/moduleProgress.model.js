const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const moduleProgressSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    module_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Module',
      required: true,
    },
    video_played_time: Number,
    quizzes_answered: [
      {
        quizz_id: mongoose.SchemaTypes.ObjectId,
        chosen_answer: Number,
        is_correct: Boolean,
        is_answered: Boolean,
        answered_at: Date,
      },
    ],
    progress: Number,
  },
  {
    timestamps: true,
    collection: 'module_progresses',
  },
);

// add plugin that converts mongoose to json
moduleProgressSchema.plugin(toJSON);
moduleProgressSchema.plugin(paginate);

/**
 * @typedef ModuleProgress
 */
const ModuleProgress = mongoose.model('ModuleProgress', moduleProgressSchema);

module.exports = ModuleProgress;

const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const moduleSchema = mongoose.Schema(
  {
    name: String,
    description: String,
    video: String,
    check_point_quizzes: [
      {
        question: String,
        correct_answer: Number,
        check_time: Number,
        answers: [
          {
            text: String,
            value: Number,
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
moduleSchema.plugin(toJSON);
moduleSchema.plugin(paginate);

/**
 * @typedef Module
 */
const Module = mongoose.model('Module', moduleSchema);

module.exports = Module;

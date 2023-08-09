const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const moduleTestSchema = mongoose.Schema(
  {
    module_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Module',
      required: true,
    },
    title: {
      type: String,
    },
    questions: [
      {
        type: Object,
      },
    ],
    correctAnswer: Number,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
moduleTestSchema.plugin(toJSON);

/**
 * @typedef ModuleTest
 */
const ModuleTest = mongoose.model('ModuleTest', moduleTestSchema, 'module_tests');

module.exports = ModuleTest;

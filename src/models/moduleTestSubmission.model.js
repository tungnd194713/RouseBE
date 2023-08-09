const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const moduleTestSubmissionSchema = mongoose.Schema(
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
    module_test_id: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'ModuleTest',
      required: true,
    },
    questions: [
      {
        type: Object,
      },
    ],
    correct_answers: Number,
    grade: Number,
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
moduleTestSubmissionSchema.plugin(toJSON);

/**
 * @typedef ModuleTestSubmission
 */
const ModuleTestSubmission = mongoose.model('ModuleTestSubmission', moduleTestSubmissionSchema, 'module_test_submissions');

module.exports = ModuleTestSubmission;

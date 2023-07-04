const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const noteSchema = mongoose.Schema(
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
    noted_video_time: {
      type: Number,
    },
    content: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
noteSchema.plugin(toJSON);

/**
 * @typedef Note
 */
const Note = mongoose.model('Note', noteSchema);

module.exports = Note;

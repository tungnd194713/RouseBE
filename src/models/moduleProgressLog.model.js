const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const moduleProgressLogSchema = mongoose.Schema(
  {
    logId: {
      type: mongoose.SchemaTypes.ObjectId,
      required: true,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    module: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Module',
      required: true,
    },
    video_start_time: Number,
    video_update_time: Number,
  },
  {
    timestamps: true,
    collection: 'module_progress_logs',
  }
);

// add plugin that converts mongoose to json
moduleProgressLogSchema.plugin(toJSON);
moduleProgressLogSchema.plugin(paginate);

/**
 * @typedef ModuleProgressLog
 */
const ModuleProgressLog = mongoose.model('ModuleProgressLog', moduleProgressLogSchema);

module.exports = ModuleProgressLog;

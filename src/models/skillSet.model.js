const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const skillSetSchema = mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
skillSetSchema.plugin(toJSON);
skillSetSchema.plugin(paginate);
/**
 * @typedef SkillSet
 */
const SkillSet = mongoose.model('SkillSet', skillSetSchema);

module.exports = SkillSet;

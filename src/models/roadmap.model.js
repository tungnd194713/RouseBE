const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const roadmapSchema = mongoose.Schema(
  {
    name: {
      // Junior frontend developer
      type: String,
      trim: true,
      required: true,
    },
    description: {
      // HOw to become a frontend dev
      type: String,
      trim: true,
    },
    mastery: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    categoryId: {
      type: Number,
      required: true,
    },
    subCategoryId: {
      type: Number,
      required: true,
    },
    milestones: [
      {
        id: mongoose.Schema.Types.ObjectId,
        title: String,
        order: Number,
        estimated_time: Number,
        modules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
      },
    ],
  },
  {
    timestamps: true,
  }
);

roadmapSchema.plugin(toJSON);
roadmapSchema.plugin(paginate);

const RoadMap = mongoose.model('RoadMap', roadmapSchema, 'roadmaps');

module.exports = RoadMap;

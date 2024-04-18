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
    //job,
    //courses,
    //status,
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
  },
  {
    timestamps: true,
  }
);

roadmapSchema.plugin(toJSON);
roadmapSchema.plugin(paginate);

const RoadMap = mongoose.model('RoadMap', roadmapSchema, 'roadmaps');

module.exports = RoadMap;

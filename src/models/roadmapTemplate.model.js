const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const roadmapTemplateSchema = mongoose.Schema(
  {
    title: {
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

roadmapTemplateSchema.plugin(toJSON);
roadmapTemplateSchema.plugin(paginate);

const RoadmapTemplate = mongoose.model('RoadmapTemplate', roadmapTemplateSchema, 'roadmapTemplates');

module.exports = RoadmapTemplate;

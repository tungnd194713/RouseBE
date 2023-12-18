/* eslint-disable camelcase */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { RoadMap } = require('../models');

async function findRoadmap(categoryId, subCategoryId, mastery) {
  const query = {};
  if (categoryId != null) query.categoryId = categoryId;
  if (subCategoryId != null) query.subCategoryId = subCategoryId;
  if (mastery != null) query.mastery = mastery;

  const roadmap = await RoadMap.findOne({ name: /.*full.*/i }).populate({
    path: 'milestones.modules',
    model: 'Module', // Replace 'Module' with the actual name of your Module model
  });

  if (!roadmap) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Roadmap not found');
  }

  return roadmap;
}

module.exports = {
  findRoadmap,
};

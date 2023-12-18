const httpStatus = require('http-status');
const { roadmapService } = require('../services');
const catchAsync = require('../utils/catchAsync');
// const ApiError = require('../utils/ApiError');

const findRoadMap = catchAsync(async (req, res) => {
  const roadmap = await roadmapService.findRoadmap(req.params.category_id, req.params.sub_category_id, req.params.mastery);
  res.status(httpStatus.OK).send(roadmap);
});

module.exports = {
  findRoadMap,
};

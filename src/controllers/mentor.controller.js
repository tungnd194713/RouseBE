const httpStatus = require('http-status');
const { mentorService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const seedMentor = catchAsync(async (req, res) => {
  const data = await mentorService.seedMentor();
  res.status(httpStatus.OK).send(data);
});

const getProfile = catchAsync(async (req, res) => {
  const data = await mentorService.getProfile(req.user._id);
  res.status(httpStatus.OK).send(data);
});

const updateProfile = catchAsync(async (req, res) => {
  const data = await mentorService.updateProfile(req.user._id, req.body);
  res.status(httpStatus.OK).send(data);
});

const getMentorShifts = catchAsync(async (req, res) => {
  const data = await mentorService.getMentorShifts(req.user._id, req.body, req.params);
  res.status(httpStatus.OK).send(data);
});

module.exports = {
	seedMentor,
	getProfile,
	updateProfile,
  getMentorShifts,
}

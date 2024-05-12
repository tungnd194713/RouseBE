const httpStatus = require('http-status');
const { mentorService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const updateProfile = catchAsync(async (req, res) => {
  const data = await mentorService.updateProfile(req.user._id, req.body);
  res.status(httpStatus.OK).send(data);
});

const getMentorShifts = catchAsync(async (req, res) => {
  const data = await mentorService.getMentorShifts(req.user._id, req.body, req.params);
  res.status(httpStatus.OK).send(data);
});

const findMentor = catchAsync(async (req, res) => {
  const data = await mentorService.findMentor(req.body);
  res.status(httpStatus.OK).send(data);
});

module.exports = {
	updateProfile,
  getMentorShifts,
  findMentor,
}

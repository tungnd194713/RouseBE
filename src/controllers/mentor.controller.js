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

const findMentor = catchAsync(async (req, res) => {
  const data = await mentorService.findMentor(req.body);
  res.status(httpStatus.OK).send(data);
});

const acceptMentorShift = catchAsync(async (req, res) => {
  const data = await mentorService.acceptMentorShift(req.user._id, req.params.mentorShiftId);
  res.status(httpStatus.OK).send(data);
});

const rejectMentorShift = catchAsync(async (req, res) => {
  const data = await mentorService.rejectMentorShift(req.user._id, req.params.mentorShiftId);
  res.status(httpStatus.OK).send(data);
});

const showCourse = catchAsync(async (req, res) => {
  const data = await mentorService.showCourse(req.user._id, req.params.courseId);
  res.status(httpStatus.OK).send(data);
});

const updateShift = catchAsync(async (req, res) => {
  const data = await mentorService.updateShift(req.user._id, req.body);
  res.status(httpStatus.OK).send(data);
});

const deleteShift = catchAsync(async (req, res) => {
  const data = await mentorService.deleteShift(req.user._id, req.params.weekday);
  res.status(httpStatus.OK).send(data);
});

const getRatingList = catchAsync(async (req, res) => {
  const data = await mentorService.getRatingList(req.user._id, req.body, req.params);
  res.status(httpStatus.OK).send(data);
});

module.exports = {
	seedMentor,
	getProfile,
	updateProfile,
  getMentorShifts,
  findMentor,
	acceptMentorShift,
	rejectMentorShift,
	showCourse,
	updateShift,
	deleteShift,
	getRatingList,
}

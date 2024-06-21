const httpStatus = require('http-status');
const { subjectService } = require('../services');
const catchAsync = require('../utils/catchAsync');
// const ApiError = require('../utils/ApiError');

const addSubject = catchAsync(async (req, res) => {
  const result = await subjectService.addSubject(req.body);
  res.status(httpStatus.OK).send(result);
});

const getSubjectList = catchAsync(async (req, res) => {
  const result = await subjectService.getSubjectList(req.query, req.body);
  res.status(httpStatus.OK).send(result);
});

const getCertificates = catchAsync(async (req, res) => {
  const result = await subjectService.getCertificates(req.query);
  res.status(httpStatus.OK).send(result);
});

const getCertificateSubject = catchAsync(async (req, res) => {
  const result = await subjectService.getCertificateSubject(req.params.id);
  res.status(httpStatus.OK).send(result);
});

const addSubjectToCertificate = catchAsync(async (req, res) => {
  const result = await subjectService.addSubjectToCertificate(req.params.id, req.body);
  res.status(httpStatus.OK).send(result);
});

const deleteSubjectFromCertificate = catchAsync(async (req, res) => {
  const result = await subjectService.deleteSubjectFromCertificate(req.params.id, req.params.subject_id);
  res.status(httpStatus.OK).send(result);
});

const addCertificate = catchAsync(async (req, res) => {
  const result = await subjectService.addCertificate(req.body);
  res.status(httpStatus.OK).send(result);
});

const getMajors = catchAsync(async (req, res) => {
  const result = await subjectService.getMajors(req.query);
  res.status(httpStatus.OK).send(result);
});

const getMajorSubject = catchAsync(async (req, res) => {
  const result = await subjectService.getMajorSubject(req.params.id, req.query.page, req.query.per_page, req.query.collegeId);
  res.status(httpStatus.OK).send(result);
});

const addSubjectToMajor = catchAsync(async (req, res) => {
  const result = await subjectService.addSubjectToMajor(req.params.id, req.body, req.query.collegeId);
  res.status(httpStatus.OK).send(result);
});

const deleteSubjectFromMajor = catchAsync(async (req, res) => {
  const result = await subjectService.deleteSubjectFromMajor(req.params.id, req.params.subject_id, req.query.collegeId);
  res.status(httpStatus.OK).send(result);
});

const getAllSubject = catchAsync(async (req, res) => {
  const result = await subjectService.getAllSubject(req.body);
  res.status(httpStatus.OK).send(result);
});

const addMajor = catchAsync(async (req, res) => {
  const result = await subjectService.addMajor(req.body);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  getCertificates,
	getCertificateSubject,
	addSubjectToCertificate,
	deleteSubjectFromCertificate,
	addCertificate,
	getAllSubject,
  getMajors,
  getMajorSubject,
  addSubjectToMajor,
  deleteSubjectFromMajor,
  addMajor,
	addSubject,
	getSubjectList,
};

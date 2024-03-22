const httpStatus = require('http-status');
const { subjectService } = require('../services');
const catchAsync = require('../utils/catchAsync');
// const ApiError = require('../utils/ApiError');

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

const getAllSubject = catchAsync(async (req, res) => {
  const result = await subjectService.getAllSubject(req.body);
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  getCertificates,
	getCertificateSubject,
	addSubjectToCertificate,
	deleteSubjectFromCertificate,
	addCertificate,
	getAllSubject,
};

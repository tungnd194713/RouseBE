const httpStatus = require('http-status');
const { companyService } = require('../services');
const catchAsync = require('../utils/catchAsync');

const me = catchAsync(async (req, res) => {
  const company = await companyService.getCompanyById(req.user._id);
  res.status(httpStatus.OK).send(company);
});

const getCompanyJobs = catchAsync(async (req, res) => {
  const jobs = await companyService.getCompanyJobs();
  res.status(httpStatus.OK).send(courses);
});

const createJob = catchAsync(async (req, res) => {
  const job = await companyService.createJob(req.user._id, req.body);
  res.status(httpStatus.OK).send(job);
});

const getJobs = catchAsync(async (req, res) => {
  const jobs = await companyService.getJobs(req.user._id, req.query);
  res.status(httpStatus.OK).send(jobs);
});

const getJobById = catchAsync(async (req, res) => {
  const job = await companyService.getJobById(req.params.id);
  res.status(httpStatus.OK).send(job);
});

const getJobCandidateApplies = catchAsync(async (req, res) => {
  const candidates = await companyService.getJobCandidateApplies(req.params.id);
  res.status(httpStatus.OK).send(candidates);
});

const deleteJob = catchAsync(async (req, res) => {
  const isDeleted = await companyService.deleteJob(req.params.id);
  if (!isDeleted) {
    res.status(httpStatus.NOT_ACCEPTABLE).send('Candidates existing');
  } else {
    res.status(httpStatus.OK).send('Deleted');
  }
});

const getCandidateApplies = catchAsync(async (req, res) => {
	const data = await companyService.getCandidateApplies(req.query);
	res.status(httpStatus.OK).send(data);
})

const getRequirementOptions = catchAsync(async (req, res) => {
	const data = await companyService.getRequirementOptions();
	res.status(httpStatus.OK).send(data);
})

const seedSubject = catchAsync(async (req, res) => {
  const jobs = await companyService.seedSubject();
  res.status(httpStatus.OK).send(jobs);
});

const getUserCv = catchAsync(async (req, res) => {
  const data = await companyService.getUserCv(req.params.userId);
  res.status(httpStatus.OK).send(data);
});

const acceptEducation = catchAsync(async (req, res) => {
  const data = await companyService.acceptEducation(req.params.candidateId);
  res.status(httpStatus.OK).send(data);
});

const acceptInterview = catchAsync(async (req, res) => {
  const data = await companyService.acceptInterview(req.params.candidateId);
  res.status(httpStatus.OK).send(data);
});

module.exports = {
	getCompanyJobs,
	me,
	createJob,
	getJobs,
	getJobById,
	getJobCandidateApplies,
	seedSubject,
	getRequirementOptions,
  deleteJob,
  getCandidateApplies,
	getUserCv,
  acceptEducation,
  acceptInterview,
}

const httpStatus = require('http-status');
const { companyService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');

const me = catchAsync(async (req, res) => {
  const company = await companyService.getCompanyById(req.user._id);
  res.status(httpStatus.OK).send(company);
});

const updateCompanyInfo = catchAsync(async (req, res) => {
  const file = req.file;
  try {
    const body = {
      ...req.body,
      logo: file.details.Location,
    }
    const data = await companyService.updateCompanyById(req.user._id, body);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    console.log(e)
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something wrong');
  }
});

const getCompanyJobs = catchAsync(async (req, res) => {
  const jobs = await companyService.getCompanyJobs();
  res.status(httpStatus.OK).send(courses);
});

const createJob = catchAsync(async (req, res) => {
  const job = await companyService.createJob(req.user._id, req.body);
  res.status(httpStatus.OK).send(job);
});

const updateJobById = catchAsync(async (req, res) => {
  const file = req.file;
  try {
    const body = {
      ...req.body
    }
    if (file) body.image_job = file.details.Location;
    const data = await companyService.updateJobById(req.params.jobId, body);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    console.log(e)
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something wrong');
  }
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
	const data = await companyService.getCandidateApplies(req.user._id, req.query);
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

const candidateUpdate = catchAsync(async (req, res) => {
  try {
    const data = await companyService.candidateUpdate(req.params.candidateId, req.body);
    res.status(httpStatus.OK).send(data);
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something wrong');
  }
});

const getCandidateEducationProgress = catchAsync(async (req, res) => {
  const data = await companyService.getCandidateEducationProgress(req.params.candidateId, req.user._id);
  res.status(httpStatus.OK).send(data);
});

const getCVMatchingPoint = catchAsync(async (req, res) => {
  const data = await companyService.getCVMatchingPoint(req.params.candidateId, req.user._id);
  res.status(httpStatus.OK).send(data);
});

const toggleJobEducation = catchAsync(async (req, res) => {
  const data = await companyService.toggleJobEducation(req.params.id, req.user._id);
  res.status(httpStatus.OK).send(data);
});

const openJobEducation = catchAsync(async (req, res) => {
  const data = await companyService.openJobEducation(req.params.id, req.user._id);
  res.status(httpStatus.OK).send(data);
});

const sendChangeRequest = catchAsync(async (req, res) => {
  const data = await companyService.sendChangeRequest(req.params.id, req.user._id, req.body);
  res.status(httpStatus.OK).send(data);
});

module.exports = {
	getCompanyJobs,
	me,
  updateCompanyInfo,
	createJob,
  updateJobById,
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
  getCandidateEducationProgress,
  getCVMatchingPoint,
  toggleJobEducation,
	openJobEducation,
  sendChangeRequest,
  candidateUpdate,
}

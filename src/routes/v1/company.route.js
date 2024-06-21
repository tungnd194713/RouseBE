const express = require('express');
const multer  = require('multer')
const upload = multer()
const auth = require('../../middlewares/auth');
const companyController = require('../../controllers/company.controller');
const authController = require('../../controllers/auth.controller');
const myCustomStorage = require("../../helpers/storage.helper");
// const { validate } = require('../../models/course.model');

const router = express.Router();

let FileStorage = myCustomStorage({
  destination: function (req, file, cb) {
    cb(null);
  },
});

let uploadFile = multer({
  storage: FileStorage,
});

router.post('/login', authController.companyLogin);
router.get('/get', companyController.getCompanyJobs);
router.get('/me', auth(), companyController.me);
router.post('/profiles/update-detail', uploadFile.single('logo'), auth(), companyController.updateCompanyInfo);
router.post('/jobs/create', uploadFile.single('image_job'), auth(), companyController.createJob);
router.post('/jobs/update/:jobId', uploadFile.single('image_job'), auth(), companyController.updateJobById);
router.get('/jobs/all', auth(), companyController.getAllJobs);
router.get('/jobs/', auth(), companyController.getJobs);
router.get('/jobs/:id', auth(), companyController.getJobById);
router.get('/jobs/:id/education-open', auth(), companyController.openJobEducation);
router.get('/jobs/:id/education-toggle', auth(), companyController.toggleJobEducation);
router.post('/jobs/:id/change-request', auth(), companyController.sendChangeRequest);
router.get('/candidate-applies/:userId', auth(), companyController.getUserCv);
router.get('/candidate-applies/job/:id', auth(), companyController.getJobCandidateApplies);
router.get('/candidate-applies/', auth(), companyController.getCandidateApplies);
router.post('/candidate-applies/accept-education/:candidateId', auth(), companyController.acceptEducation);
router.post('/candidate-applies/accept-interview/:candidateId', auth(), companyController.acceptInterview);
router.get('/candidate-applies/education-progress/:candidateId', auth(), companyController.getCandidateEducationProgress);
router.get('/candidate-applies/education-statistic/:candidateId', auth(), companyController.getProgressStatistic);
router.get('/candidate-applies/matching-point/:candidateId', auth(), companyController.getCVMatchingPoint);
router.post('/candidate-applies/update-status/:candidateId', auth(), companyController.candidateUpdate);
router.post('/educations/list', auth(), companyController.getEducationList);
router.post('/educations/create', auth(), companyController.createNewEducationRequest);
router.get('/educations/detail/:id', auth(), companyController.getEducationDetail);
router.get('/educations/participants/:id', auth(), companyController.getEducationParticipant);
router.post('/educations/create/:jobId', auth(), companyController.requestEducationForJob);
router.get('/requirement-options', auth(), companyController.getRequirementOptions);
router.delete('/jobs/:id', auth(), companyController.deleteJob);
router.post('/seed-subject', companyController.seedSubject);

module.exports = router;

const express = require('express');
const multer  = require('multer')
const upload = multer()
const auth = require('../../middlewares/auth');
const companyController = require('../../controllers/company.controller');
const authController = require('../../controllers/auth.controller');
// const { validate } = require('../../models/course.model');

const router = express.Router();

router.post('/login', authController.companyLogin);
router.get('/get', companyController.getCompanyJobs);
router.get('/me', auth(), companyController.me);
router.post('/jobs/create', upload.none(), auth(), companyController.createJob);
router.get('/jobs/', auth(), companyController.getJobs);
router.get('/jobs/:id', auth(), companyController.getJobById);
router.get('/jobs/:id/education-open', auth(), companyController.openJobEducation);
router.get('/jobs/:id/education-toggle', auth(), companyController.toggleJobEducation);
router.get('/candidate-applies/:userId', auth(), companyController.getUserCv);
router.get('/candidate-applies/job/:id', auth(), companyController.getJobCandidateApplies);
router.get('/candidate-applies/', auth(), companyController.getCandidateApplies);
router.post('/candidate-applies/accept-education/:candidateId', auth(), companyController.acceptEducation);
router.post('/candidate-applies/accept-interview/:candidateId', auth(), companyController.acceptInterview);
router.get('/candidate-applies/education-progress/:candidateId', auth(), companyController.getCandidateEducationProgress);
router.get('/candidate-applies/matching-point/:candidateId', auth(), companyController.getCVMatchingPoint);
router.get('/requirement-options', auth(), companyController.getRequirementOptions);
router.delete('/jobs/:id', auth(), companyController.deleteJob);
router.post('/seed-subject', companyController.seedSubject);

module.exports = router;

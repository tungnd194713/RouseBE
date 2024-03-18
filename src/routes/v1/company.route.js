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
router.get('/candidate-applies/job/:id', auth(), companyController.getJobCandidateApplies);
router.get('/requirement-options', auth(), companyController.getRequirementOptions);
router.post('/seed-subject', companyController.seedSubject);

module.exports = router;

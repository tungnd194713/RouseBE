const express = require('express');
const auth = require('../../middlewares/auth');
const subjectController = require('../../controllers/subject.controller');

const router = express.Router();

router.get('/certificates', auth(), subjectController.getCertificates);
router.get('/certificates/:id/subjects', auth(), subjectController.getCertificateSubject);
router.post('/certificates/:id/subjects', auth(), subjectController.addSubjectToCertificate);
router.delete('/certificates/:id/subjects/:subject_id', auth(), subjectController.deleteSubjectFromCertificate);
router.post('/certificates', auth(), subjectController.addCertificate);
router.get('/majors', auth(), subjectController.getMajors);
router.get('/majors/:id/subjects', auth(), subjectController.getMajorSubject);
router.post('/majors/:id/subjects', auth(), subjectController.addSubjectToMajor);
router.delete('/majors/:id/subjects/:subject_id', auth(), subjectController.deleteSubjectFromMajor);
router.post('/majors', auth(), subjectController.addMajor);
router.post('/subjects', auth(), subjectController.getAllSubject);
router.post('/subjects/list', auth(), subjectController.getSubjectList);
router.post('/subjects/create', auth(), subjectController.addSubject);

module.exports = router;

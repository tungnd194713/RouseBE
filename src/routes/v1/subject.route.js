const express = require('express');
const auth = require('../../middlewares/auth');
const subjectController = require('../../controllers/subject.controller');

const router = express.Router();

router.get('/certificates', auth(), subjectController.getCertificates);
router.get('/certificates/:id/subjects', auth(), subjectController.getCertificateSubject);
router.post('/certificates/:id/subjects', auth(), subjectController.addSubjectToCertificate);
router.delete('/certificates/:id/subjects/:subject_id', auth(), subjectController.deleteSubjectFromCertificate);
router.post('/certificates', auth(), subjectController.addCertificate);
router.post('/subjects', auth(), subjectController.getAllSubject);

module.exports = router;

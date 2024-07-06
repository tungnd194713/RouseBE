const express = require('express');
const auth = require('../../middlewares/auth');
const subjectController = require('../../controllers/subject.controller');

const router = express.Router();

router.get('/certificates', auth('manageSkills'), subjectController.getCertificates);
router.post('/certificates', auth('manageSkills'), subjectController.addCertificate);
router.put('/certificates/:id', auth('manageSkills'), subjectController.updateCertificate);
router.delete('/certificates/:id', auth('manageSkills'), subjectController.removeCertificate);
router.get('/majors', auth('manageSkills'), subjectController.getMajors);
router.post('/majors', auth('manageSkills'), subjectController.addMajor);
router.put('/majors/:id', auth('manageSkills'), subjectController.updateMajor);
router.delete('/majors/:id', auth('manageSkills'), subjectController.removeMajor);
router.get('/colleges', auth('manageSkills'), subjectController.getColleges);
router.post('/colleges', auth('manageSkills'), subjectController.addCollege);
router.put('/colleges/:id', auth('manageSkills'), subjectController.updateCollege);
router.delete('/colleges/:id', auth('manageSkills'), subjectController.removeCollege);
router.get('/certificates/:id/subjects', auth('manageSkills'), subjectController.getCertificateSubject);
router.post('/certificates/:id/subjects', auth('manageSkills'), subjectController.addSubjectToCertificate);
router.delete('/certificates/:id/subjects/:subject_id', auth('manageSkills'), subjectController.deleteSubjectFromCertificate);
router.get('/majors/:id/subjects', auth('manageSkills'), subjectController.getMajorSubject);
router.post('/majors/:id/subjects', auth('manageSkills'), subjectController.addSubjectToMajor);
router.delete('/majors/:id/subjects/:subject_id', auth('manageSkills'), subjectController.deleteSubjectFromMajor);
router.post('/subjects', auth('manageSkills'), subjectController.getAllSubject);
router.post('/subjects/list', auth('manageSkills'), subjectController.getSubjectList);
router.post('/subjects/create', auth('manageSkills'), subjectController.addSubject);

module.exports = router;

const httpStatus = require("http-status");
const { Certificate, CertificateSubjects, Subject, Major, CollegeSubjects, College } = require("../models");
const ApiError = require("../utils/ApiError");

const getAllSubject = async (body) => {
	const findCondition = {}
	if (body.current_subjects && body.current_subjects.length) {
		findCondition._id = { $nin: body.current_subjects };
	}
	return Subject.find(findCondition);
}

const getSubjectList = async (params, body) => {
	const findCondition = {}
	if (body.name) {
		findCondition.name = { "$regex": body.name, "$options": "i" };
	}
	const subjects = await Subject.find(findCondition).limit(params.per_page ? Number(params.per_page) : 10).skip(params.current_page ? (Number(params.current_page) - 1) * Number(params.per_page) : 0).sort('-createdAt');
	const total = await Subject.countDocuments();
	return {
		data: subjects,
		meta: {
			total,
			per_page: params.per_page,
			current_page: params.current_page,
		}
	}
}


const addSubject = async (body) => {
	const subject = await Subject.findOne({ name: body.name })
	if (subject) {
		throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Subject existed!');
	}
	return Subject.create({
		name: body.name,
	});
}

const getCertificates = async (params) => {
	const searchData = {};
	if (params.name) {
		searchData.name = params.name;
	}
	const certificates = await Certificate.find({}).limit(params.per_page ? Number(params.per_page) : 10).skip(params.current_page ? (Number(params.current_page) - 1) * Number(params.per_page) : 0);
	const total = await Certificate.countDocuments();
	return {
		data: certificates,
		meta: {
			total,
			per_page: params.per_page,
			current_page: params.current_page,
		}
	}
}

const getCertificateSubject = async (id, page = 1, pageSize = 10) => {
	const certificate = await Certificate.findById(id);
	if (certificate) {
		try {
			const result = await CertificateSubjects.findOne({ certificate: id }).populate('subject_objects.subject');
			const levelOrder = {
				Beginner: 0,
				Intermediate: 1,
				Advanced: 2
			};
			if (result) {
        const subjects = result?.subject_objects.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

        return {
          name: certificate.name,
          subjects,
        };
      }
      return {
        name: certificate.name,
        subjects: []
      }
		} catch (err) {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
		}
	}
}

const addSubjectToCertificate = async (certificate_id, body) => {
	try {
		let certificateSubject = await CertificateSubjects.findOne({certificate: certificate_id});

		if (!certificateSubject) {
			certificateSubject = await CertificateSubjects.create({
				certificate: certificate_id,
				subject_objects: [],
			})
		}

		const isSubjectPresent = certificateSubject.subject_objects.some(subjectObj => subjectObj.subject.toString() === body.subjectId);

		if (isSubjectPresent) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Subject already exists in CertificateSubject');
		}

		const newSubjectObject = {
			subject: body.subjectId,
			level: body.level
		};
		certificateSubject.subject_objects.push(newSubjectObject);

		// Save the updated CertificateSubject document
		await certificateSubject.save();
	} catch (err) {
		console.log(err)
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something wrong');
	}
}

const deleteSubjectFromCertificate = async (certificateId, subjectId) => {
	try {
		// Update the CertificateSubject document
		const result = await CertificateSubjects.updateOne(
			{ certificate: certificateId },
			{ $pull: { subject_objects: { subject: subjectId } } }
		);

		// Check if any documents were modified
		if (result.nModified > 0) {
			return 'Changed!'
		} else {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something wrong');
		}
	} catch (err) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something wrong');
	}
}

const addCertificate = async (body) => {
	return Certificate.create(body);
}

const updateCertificate = async (id, body) => {
	return Certificate.findByIdAndUpdate(id, body);
}

const removeCertificate = async (body) => {
	return Certificate.findByIdAndRemove(body);
}

const addMajor = async (body) => {
	return Major.create(body);
}

const updateMajor = async (id, body) => {
	return Major.findByIdAndUpdate(id, body);
}

const removeMajor = async (body) => {
	return Major.findByIdAndRemove(body);
}

const getMajors = async (params) => {
	const searchData = {};
	if (params.name) {
		searchData.name = params.name;
	}
	const majors = await Major.find({}).limit(params.per_page ? Number(params.per_page) : 10).skip(params.current_page ? (Number(params.current_page) - 1) * Number(params.per_page) : 0);
	const total = await Major.countDocuments();
	return {
		data: majors,
		meta: {
			total,
			per_page: params.per_page,
			current_page: params.current_page,
		}
	}
}

const getMajorSubject = async (majorId, page = 1, pageSize = 10, collegeId = null) => {
	const major = await Major.findById(majorId);
	if (major) {
		try {
			const result = await CollegeSubjects.findOne({ major: majorId, college: collegeId ? collegeId : '000000000000' }).populate('subject_objects.subject');
			const levelOrder = {
				Beginner: 0,
				Intermediate: 1,
				Advanced: 2
			};
      if (result) {
        const subjects = result.subject_objects.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

        return {
          name: major.name,
          subjects,
        };
      }
      return {
        name: major.name,
        subjects: [],
      }
		} catch (err) {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err);
		}
	}
}

const addSubjectToMajor = async (major_id, body, college_id = null) => {
	try {
		let majorSubject = await CollegeSubjects.findOne({major: major_id, college: college_id ? college_id : '000000000000'});

		if (!majorSubject) {
			majorSubject = await CollegeSubjects.create({
				major: major_id,
				subject_objects: [],
			})
		}

		const isSubjectPresent = majorSubject.subject_objects.some(subjectObj => subjectObj.subject.toString() === body.subjectId);

		if (isSubjectPresent) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Subject already exists in CertificateSubject');
		}

		const newSubjectObject = {
			subject: body.subjectId,
			level: body.level
		};
		majorSubject.subject_objects.push(newSubjectObject);

		// Save the updated CertificateSubject document
		await majorSubject.save();
	} catch (err) {
		console.log(err)
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something wrong');
	}
}

const deleteSubjectFromMajor = async (major_id, subjectId, college_id = null) => {
	try {
		// Update the CollegeSubjects document
		const result = await CollegeSubjects.updateOne(
			{ major: major_id, college: college_id ? college_id : '000000000000' },
			{ $pull: { subject_objects: { subject: subjectId } } }
		);

		// Check if any documents were modified
		if (result.nModified > 0) {
			return 'Changed!'
		} else {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something wrong');
		}
	} catch (err) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something wrong');
	}
}

const addCollege = async (body) => {
	return College.create(body);
}

const updateCollege = async (id, body) => {
	return College.findByIdAndUpdate(id, body);
}

const removeCollege = async (body) => {
	return College.findByIdAndRemove(body);
}

const getColleges = async (params) => {
	const searchData = {};
	if (params.name) {
		searchData.name = params.name;
	}
	const colleges = await College.find({}).limit(params.per_page ? Number(params.per_page) : 10).skip(params.current_page ? (Number(params.current_page) - 1) * Number(params.per_page) : 0);
	const total = await College.countDocuments();
	return {
		data: colleges,
		meta: {
			total,
			per_page: params.per_page,
			current_page: params.current_page,
		}
	}
}

module.exports = {
	getAllSubject,
	getCertificates,
  getMajorSubject,
  addSubjectToMajor,
  deleteSubjectFromMajor,
	getCertificateSubject,
	addSubjectToCertificate,
	deleteSubjectFromCertificate,
	addCertificate,
  addMajor,
  getMajors,
  addCollege,
  getColleges,
	addSubject,
	getSubjectList,
  updateCertificate,
  removeCertificate,
  updateMajor,
  removeMajor,
  updateCollege,
  removeCollege,
}

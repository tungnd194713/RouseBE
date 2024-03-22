const httpStatus = require("http-status");
const { Certificate, CertificateSubjects, Subject } = require("../models");
const ApiError = require("../utils/ApiError");

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
			const subjects = result.subject_objects.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);

			return {
				name: certificate.name,
				subjects,
			};
			
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

const getAllSubject = async (body) => {
	const findCondition = {}
	if (body.current_subjects && body.current_subjects.length) {
		findCondition._id = { $nin: body.current_subjects };
	}
	return Subject.find(findCondition);
}

module.exports = {
	getCertificates,
	getCertificateSubject,
	addSubjectToCertificate,
	deleteSubjectFromCertificate,
	addCertificate,
	getAllSubject,
}
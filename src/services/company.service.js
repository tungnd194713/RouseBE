const mongoose = require('mongoose');
const { Company, Job, CandidateApply, Subject, College, Certificate, Major, CertificateSubjects, CollegeSubjects, JobEducation, UserProfile, User } = require('../models');
const JobRequirement = require('../models/jobRequirement.model');
const ApiError = require('../utils/ApiError');

function formatDate(dateString) {
	const date = new Date(dateString);
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

function addMonthsToDate(inputDate, monthsToAdd) {
	const newDate = new Date(inputDate);

	// Adding the specified number of months
	newDate.setMonth(newDate.getMonth() + monthsToAdd);

	// Format the date as YYYY-MM-DD
	const formattedDate = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}-${String(newDate.getDate()).padStart(2, '0')}`;

	return formattedDate;
}

function skillLevelCompare(requirementLevel, profileLevel) {
	if (requirementLevel == 'Advanced') {
		if (profileLevel == 'Advanced') return 1;
		if (profileLevel == 'Intermediate') return 0.5;
		if (profileLevel == 'Beginner') return 0;
	}
	if (requirementLevel == 'Intermediate') {
		if (profileLevel == 'Advanced') return 1;
		if (profileLevel == 'Intermediate') return 1;
		if (profileLevel == 'Beginner') return 0.5;
	}
	if (requirementLevel == 'Beginner') {
		if (profileLevel == 'Advanced') return 1;
		if (profileLevel == 'Intermediate') return 1;
		if (profileLevel == 'Beginner') return 1;
	}
}

const getCompanyJobs = async () => {
	const companiesData = [
		{
			company_name: 'ABC Corporation',
			email: 'info@gmail.com',
			password: 'password123',
			login_type: 0,
			manager_name: 'John Doe',
			address: '123 Main Street',
			phone: '123-456-7890',
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			status: 1,
		},
		{
			company_name: 'XYZ Inc.',
			email: 'xyz@example.com',
			password: 'password456',
			login_type: 1,
			facebook_id: 'xyz123',
			manager_name: 'Jane Smith',
			address: '456 Elm Street',
			phone: '987-654-3210',
			description: 'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
			status: 1,
		},
		// Add more company data as needed
	];

	// Insert companies data into the database
	return Company.insertMany(companiesData);
}

const getCompanyByEmail = async (email) => {
  return Company.findOne({ email });
};

const getCompanyById = async (id) => {
	return Company.findById(id);
}

const createJob = async (company_id, data) => {
	const slug = data.title;

  const job = await Job.create({
		...data,
		company_id,
		slug,
	});

  if (job) {
		if (data.accept_education) {
			await JobEducation.create({
				company: company_id,
				job: job.id,
				max_education_month: data.max_education_month,
				scholarship: data.scholarship,
			})
		}

    const beginnerSkills = JSON.parse(data.beginnerSkills);
    const intermediateSkills = JSON.parse(data.intermediateSkills);
    const advancedSkills = JSON.parse(data.advancedSkills);
    const certificates = JSON.parse(data.certificates);
    const collegeMajors = JSON.parse(data.collegeMajors);

    const beginnerData = beginnerSkills.map(subArray => {
      const ids = subArray.map(obj => obj.id);
      return {
        job: job.id,
        company: company_id,
        skills: ids,
        level: 'Beginner',
        type: 'Skill',
      }
    });
    const intermediateData = intermediateSkills.map(subArray => {
      const ids = subArray.map(obj => obj.id);
      return {
        job: job.id,
        company: company_id,
        skills: ids,
        level: 'Intermediate',
        type: 'Skill',
      }
    });
    const advancedData = advancedSkills.map(subArray => {
      const ids = subArray.map(obj => obj.id);
      return {
        job: job.id,
        company: company_id,
        skills: ids,
        level: 'Advanced',
        type: 'Skill',
      }
    });
    const certificateData = certificates.map(subArray => {
      const ids = subArray.map(obj => obj.id);
      return {
        job: job.id,
        company: company_id,
        certificates: ids,
        type: 'Certificate',
      }
    });
    const collegeMajorData = collegeMajors.map(subArray => {
      const majors = subArray.majors.map(obj => obj.id);
      const colleges = subArray.colleges.map(obj => obj.id);
      return {
        job: job.id,
        company: company_id,
        majors,
        colleges,
        type: 'Major',
      }
    });

    const requirementData = beginnerData.concat(intermediateData, advancedData, certificateData, collegeMajorData);
    const requirements = await JobRequirement.insertMany(requirementData);
    return {
      job,
      requirements,
    }
  } else {
    throw new Error('Something wrong');
  }
}

const getJobs = async (company_id, params) => {
	const filter = {
    title: { "$regex": params.title, "$options": "i" },
		company_id,
  }
	if (params.status) {
		filter.status = params.status
	}
  const queryOptions = {
    populate: 'candidateApplies jobEducation'
	}
	let jobs = await Job.paginate(filter, queryOptions);
	const jobData = jobs.results.map(job => {
		return {
				...job.toObject(),
				date_start: job.date_start ? formatDate(job.date_start) : null,
				date_end: job.date_start ? addMonthsToDate(job.date_start, job.display_month) : null,
				max_education_month: job.jobEducation.length ? job.jobEducation[0].max_education_month : null,
				scholarship: job.jobEducation.length ? job.jobEducation[0].scholarship : null,
        education_status: job.jobEducation.length ? job.jobEducation[0].status : null,
        candidate_applies: job.candidateApplies,
				id: job._id,
		};
	});
	return {
		data: jobData,
		meta: {
			total: jobs.totalResults,
			current_page: jobs.page,
			per_page: jobs.limit,
		}
	};
}

const getJobById = async (id) => {
	let job = await Job.findById(id);
  const education = await JobEducation.findOne({job: job.id});
  job = {
    ...job.toObject(),
    max_education_month: education ? education.max_education_month : null,
    scholarship: education ? education.scholarship : null,
    id: job._id,
    education_status: education ? education.status : null,
    date_end: job.date_start ? addMonthsToDate(job.date_start, job.display_month) : null,
  }
  const requirements = await JobRequirement.find({job: job.id}).populate('skills certificates majors colleges');
  const beginnerSkills = requirements.filter(item => item.type === 'Skill' && item.level === 'Beginner').map(obj => obj.skills);
  const intermediateSkills = requirements.filter(item => item.type === 'Skill' && item.level === 'Intermediate').map(obj => obj.skills);
  const advancedSkills = requirements.filter(item => item.type === 'Skill' && item.level === 'Advanced').map(obj => obj.skills);
  const certificates = requirements.filter(item => item.type === 'Certificate').map(obj => obj.certificates);
  const majorColleges = requirements.filter(item => item.type === 'Major').map(obj => {
    return {
      majors: obj.majors,
      colleges: obj.colleges
    }
  });
  const previewSkills = requirements.filter(item => item.type === 'Skill').map(obj => obj.skills);

	return {
		job,
    beginnerSkills,
    intermediateSkills,
    advancedSkills,
    certificates,
    majorColleges,
    previewSkills,
	}
}

const deleteJob = async (job_id) => {
  const hasCandidateApply = await CandidateApply.countDocuments({job_id});
  if (hasCandidateApply && hasCandidateApply > 0) {
    return false;
  } else {
    await Job.deleteOne({_id: job_id})
    await JobRequirement.deleteMany({job: job_id})
    return true;
  }
}

const getCandidateApplies = async (company, params, options = {}) => {
	const filter = {
    company,
  }
  const queryOptions = {
		...options,
    populate: 'user job',
	}
	if (params && params.key_word) {
		const jobs = await Job.find({title: { "$regex": params.key_word, "$options": "i" }});
		const jobIds = jobs.map((item) => item._id || item.id);
		filter.job = { $in: jobIds };
	}
  if (params && params.status) {
    filter.status = params.status;
  }
	return CandidateApply.paginate(filter, queryOptions);
}

const getJobCandidateApplies = async (job_id, options, params) => {
  const filter = {
    job: job_id,
  }
  const queryOptions = {
		...options,
    populate: 'user job'
	}
  if (params && params.status) {
    filter.status = params.status;
  }
	return CandidateApply.paginate(filter, queryOptions);
}

const getUserCv = async (candidateApplyId) => {
  const candidateApply = await CandidateApply.findById(candidateApplyId).populate('job');
  if (!candidateApply) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CV not found');
  }
  const jobEducation = candidateApply.job.accept_education ? await JobEducation.findOne({job: candidateApply.job._id}) : null;
	const profile = await UserProfile.findOne({ user: candidateApply.user }).populate('user skills.skill educations.college educations.major certificates.certificate');
	return {
    ...candidateApply.toObject(),
		...profile.toObject(),
    id: candidateApply._id || candidateApply.id,
    candidateApplyId: candidateApply._id || candidateApply.id,
    jobEducation,
	}
}

const acceptEducation = async (candidateApplyId) => {
  const candidateApply = await CandidateApply.findById(candidateApplyId);
  if (!candidateApply) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CV not found');
  }
  candidateApply.status = 3
  await candidateApply.save();
  return 'Update success'
}

const acceptInterview = async (candidateApplyId) => {
  const candidateApply = await CandidateApply.findById(candidateApplyId);
  if (!candidateApply) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CV not found');
  }
  candidateApply.status = 2
  await candidateApply.save();
  return 'Update success'
}

const mainSuggestionLogic = async (beginnerSkills, intermediateSkills, advancedSkills, certificates, collegeMajors) => {
	const certificateObjects = await CertificateSubjects.find({
		certificates: { $in: certificates },
	})
	const certificateSubjectObjects = certificateObjects.map(item => item.subject_objects);
	const certificateSubjects = certificateObjects.map(item => item.subject);

	const majorObjects = await CollegeSubjects.find({
		colleges: { $in: collegeMajors.map(item => item.college) },
		major: { $in: collegeMajors.map(item => item.major) },
	})

	const majorSubjectObjects = majorObjects.map(item => item.subject_objects);
	const majorSubjects = majorSubjectObjects.map(item => item.subject);

	const skillIds = beginnerSkills.map(item => item.id).concat(intermediateSkills.map(item => item.id), advancedSkills.map(item => item.id), certificateSubjects, majorSubjects);
	const requirements = JobRequirement.find({
		skills: { $in: skillIds }
	})
	const allJobIds = requirements.map(item => item.job);
	const allJobs = Job.find({_id: { $in: allJobIds }});
	// For each to handle
}

const seedSubject = async() => {
	// const subjects = [
	// 	"Cơ sở dữ liệu",
	// 	"Mạng máy tính",
	// 	"Hệ thống thông tin",
	// 	"An toàn thông tin",
	// 	"Công nghệ web",
	// 	"AWS fundamental",
	// 	"Cấu trúc dữ liệu và giải thuật",
	// 	"Toán rời rạc",
	// 	"Lập trình hướng đối tượng",
	// 	"Kỹ thuật phần mềm",
	// 	"Lập trình web",
	// 	"Mạng internet",
	// 	"Lập trình mạng",
	// 	"Cisco network",
	// 	"AWS developer",
	// 	"Azure fundamental",
	// 	"Agile",
	// 	"AngularJS",
	// 	"ASP.NET",
	// 	"Assembly",
	// 	"Automation Test",
	// 	"C#",
	// 	"C++",
	// 	"C",
	// 	"Cloud",
	// 	"COBOL",
	// 	"Cocos",
	// 	"CSS",
	// 	"Dart",
	// 	"Django",
	// 	"Drupal",
	// 	"Embedded",
	// 	"ERP",
	// 	"Flutter",
	// 	"Golang",
	// 	"Groovy",
	// 	"HTML5",
	// 	"J2EE",
	// 	"Java",
	// 	"JavaScript",
	// 	"JQuery",
	// 	"Kotlin",
	// 	"Laravel",
	// 	"Linux",
	// 	"Magento",
	// 	"MVC",
	// 	"MySQL",
	// 	".NET",
	// 	"NodeJS",
	// 	"NoSQL",
	// 	"Objective C",
	// 	"OOP",
	// 	"OpenStack",
	// 	"Oracle",
	// 	"PHP",
	// 	"PostgreSql",
	// 	"Python",
	// 	"ReactJS",
	// 	"React Native",
	// 	"Ruby",
	// 	"Ruby on Rails",
	// 	"Salesforce",
	// 	"SAP",
	// 	"Scala",
	// 	"Scrum",
	// 	"Solidity",
	// 	"Spring",
	// 	"SQL",
	// 	"Swift",
	// 	"Integrated Test",
	// 	"Unit Test",
	// 	"TypeScript",
	// 	"UI-UX",
	// 	"Unity",
	// 	"VueJS",
	// 	"Wordpress"
	// ];

	// const data = subjects.map((item) => {
	// 	return {
	// 		name: item,
	// 	}
	// })

	// const certificates = [
	// 	'IT Passport (IP)',
	// 	'Fundamental IT Engineering (FE)',
	// 	'AWS Certificated Clound Practitioner - Associate',
	// 	'AWS Certificated Developer - Associate',
	// 	'AWS Certificated SysOps Administrator - Associate',
	// 	'AWS Certificated Solutions Architect - Associate',
	// 	'AWS Certificated Solutions Architect - Professional',
	// 	'AWS Certificated DevOps Engineer Engineer - Professional',
	// 	'AWS Certificated Advanced Networking - Professional',
	// 	'AWS Certificated Database - Specialty',
	// 	'Azure Fundamentals (AZ-900)',
	// 	'Azure Security Engineer Associate (AZ-500)',
	// 	'Azure Database Administrator Associate (DP-300)',
	// 	'Oracle Database SQL Associate (OCA)',
	// 	'Oracle Database SQL Professional (OCP)',
	// 	'Cisco Certified Network Associate (CCNA)',
	// 	'Cisco Certified Network Professional (CCNP)',
	// 	'Certified Network Defender (CND)',
	// 	'LPIC-1 Certified Linux Administrator',
	// 	'LPIC-2 Certified Linux Administrator',
	// ]

	// const data = certificates.map((item) => {
	// 	return {
	// 		name: item,
	// 	}
	// })

	// return Certificate.insertMany(data);

	const majors = [
		'Công nghệ thông tin',
		'Hệ thống thông tin',
		'An toàn thông tin',
		'Kỹ thuật phần mềm',
		'Kỹ thuật máy tính',
		'Khoa học máy tính',
	]

	const data = majors.map((item) => {
		return {
			name: item,
		}
	})

	return Major.insertMany(data);
}

const getRequirementOptions = async () => {
	const skills = await Subject.find({});
	const certificates = await Certificate.find({});
	const majors = await Major.find({});
	const colleges = await College.find({});

	return {
		skills,
		certificates,
		majors,
		colleges,
	}
}

module.exports = {
	getCompanyByEmail,
	getCompanyJobs,
	getCompanyById,
	createJob,
	getJobs,
	getJobById,
  getCandidateApplies,
	getJobCandidateApplies,
	seedSubject,
	getRequirementOptions,
  deleteJob,
	getUserCv,
  acceptEducation,
  acceptInterview,
}

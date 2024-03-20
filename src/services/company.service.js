const mongoose = require('mongoose');
const { Company, Job, CandidateApply, Subject, College, Certificate, Major, CertificateSubjects, CollegeSubjects } = require('../models');

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
	return Job.create({
		...data,
		company_id,
		slug,
	});
}

const getJobs = async (company_id, params) => {
	const jobs = await Job.find({});
	const total = await Job.countDocuments({});
	return {
		data: jobs,
		meta: {
			total,
			current_page: 1,
			per_page: 10,
		}
	};
}

const getJobById = async (id) => {
	const job = await Job.findById(id);
	return {
		job,
	}
}

const getJobCandidateApplies = async (job_id) => {
	return CandidateApply.find({job_id});
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
	getJobCandidateApplies,
	seedSubject,
	getRequirementOptions,
}
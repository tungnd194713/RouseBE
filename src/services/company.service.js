const mongoose = require('mongoose');
const { Company, Job, CandidateApply } = require('../models');

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

// [
// 	"Agile",
// 	"Android",
// 	"Angular",
// 	"AngularJS",
// 	"ASP.NET",
// 	"Assembly",
// 	"Automation Test",
// 	"AWS",
// 	"Azure",
// 	"Blockchain",
// 	"Bridge Engineer",
// 	"Business Analyst",
// 	"C#",
// 	"C++",
// 	"C language",
// 	"Cloud",
// 	"COBOL",
// 	"Cocos",
// 	"CSS",
// 	"Dart",
// 	"Data Analyst",
// 	"Database",
// 	"Designer",
// 	"DevOps",
// 	"Django",
// 	"Drupal",
// 	"Embedded",
// 	"English",
// 	"ERP",
// 	"Flutter",
// 	"Games",
// 	"Golang",
// 	"Groovy",
// 	"HTML5",
// 	"iOS",
// 	"IT Support",
// 	"J2EE",
// 	"Japanese",
// 	"Java",
// 	"JavaScript",
// 	"JQuery",
// 	"Kotlin",
// 	"Laravel",
// 	"Linux",
// 	"Magento",
// 	"Manager",
// 	"MVC",
// 	"MySQL",
// 	".NET",
// 	"Networking",
// 	"NodeJS",
// 	"NoSQL",
// 	"Objective C",
// 	"OOP",
// 	"OpenStack",
// 	"Oracle",
// 	"PHP",
// 	"PostgreSql",
// 	"Product Manager",
// 	"Project Manager",
// 	"Python",
// 	"QA QC",
// 	"ReactJS",
// 	"React Native",
// 	"Ruby",
// 	"Ruby on Rails",
// 	"Salesforce",
// 	"SAP",
// 	"Scala",
// 	"Scrum",
// 	"Sharepoint",
// 	"Software Architect",
// 	"Solidity",
// 	"Spring",
// 	"SQL",
// 	"Swift",
// 	"System Admin",
// 	"System Engineer",
// 	"Team Leader",
// 	"Tester",
// 	"TypeScript",
// 	"UI-UX",
// 	"Unity",
// 	"VueJS",
// 	"Wordpress"
// ]

module.exports = {
	getCompanyByEmail,
	getCompanyJobs,
	getCompanyById,
	createJob,
	getJobs,
	getJobById,
	getJobCandidateApplies,
}
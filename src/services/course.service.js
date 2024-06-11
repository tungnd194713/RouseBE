// const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { ModuleProgress, User, Module, Course, Subject } = require('../models');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line camelcase
const getCourse = async (_id, user_id) => {
  const courses = await Module.findOne({ _id });
  let moduleProgress = await ModuleProgress.findOne({ module_id: _id, user_id }).select('-_id');
  if (!moduleProgress) {
    moduleProgress = await ModuleProgress.create({
      video_played_time: 0,
      module_id: _id,
      progress: 0,
      user_id,
    });
  }
  return {
    ...courses.toObject(),
    ...moduleProgress.toObject(),
  };
};

const getUserCourse = async (userId) => {
  const result = await User.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'courses',
        localField: 'applied_courses',
        foreignField: '_id',
        as: 'applied_courses',
      },
    },
    { $unwind: '$applied_courses' },
    {
      $lookup: {
        from: 'modules',
        localField: 'applied_courses.modules',
        foreignField: '_id',
        as: 'applied_courses.modules',
      },
    },
    { $unwind: '$applied_courses.modules' },
    {
      $lookup: {
        from: 'module_progresses',
        let: { module_id: '$applied_courses.modules._id' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$module_id', '$$module_id'] },
              user_id: mongoose.Types.ObjectId(userId),
            },
          },
        ],
        as: 'applied_courses.modules.progress',
      },
    },
    { $unwind: { path: '$applied_courses.modules.progress', preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: '$_id',
        applied_courses: { $push: '$applied_courses' },
      },
    },
    {
      $project: {
        _id: 0,
        applied_courses: 1,
      },
    },
  ]).exec();
  return result;
};

// "moduleProgress": {
//   "user_id": "649be04599a717581883ccd7",
//   "module_id": "649be04599a717581883ccd7",
//   "video_played_time": 0,
//   "quizzes_answered": [
//     {
//       "quizz_id": "ObjectId",
//       "chosen_answer": "Number",
//       "is_correct": "Boolean",
//       "is_answered": "Boolean",
//       "answered_at": "Datetime"
//     }
//   ],
//   "progress": 0,
//   "id": "649be3fc50bf7d37fa67257e"
// }
const updateModuleProgress = async (moduleId, updateBody) => {
  const result = await ModuleProgress.findByIdAndUpdate(moduleId, updateBody);
  return result;
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter (body)
 * @param {Object} options - Query options (query)
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const getCourses = async (filter, options) => {
	const queryOption = {
		...options,
		populate: 'skill_tags.skill,in_charge',
	}
  const filterOption = {}
  if (filter.level) {
    filterOption['skill_tags'] = {
      $elemMatch: {
        'level': filter.level
      }
    }
  }
  if (filter.skillId) {
    filterOption['skill_tags'] = {
      $elemMatch: {
        'skill': filter.skillId,
      }
    }
  }
  if (filter.skillId && filter.level) {
    filterOption['skill_tags'] = {
      $elemMatch: {
        'skill': filter.skillId,
        'level': filter.level
      }
    }
  }
	const courses = await Course.paginate(filterOption, queryOption);
	return courses;
}

const createCourse = async (body) => {
	const data = {
		...body,
		skill_tags: JSON.parse(body.tags),
	}

	return Course.create(data);
}

const updateCourseInfo = async (courseId, body) => {
	const course = await Course.findById(courseId);

  if (!course) throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  course.title = body.title;
  course.description = body.description;
  course.point_cost = body.point_cost;
  course.estimated_time = body.estimated_time;

	await course.save()
  return 'Update success';
}

const addModuleToCourse = async (courseId, body) => {
	try {
		const course = await Course.findById(courseId);
		if (!course) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
		}
		const module = await Module.create(body);
		if (!module) {
			throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');
		}
		await Course.findByIdAndUpdate(
			courseId,
			{ $push: { modules: module._id } },
		);
		return module; // return the added module if needed
	} catch (error) {
		if (error instanceof mongoose.Error) {
			throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
		}
		throw error;
	}
}

const findCourseById = async (courseId) => {
	return Course.findById(courseId).populate('modules');
}

const seedLearningData = async () => {
	const subject = await Subject.findOne({ name: 'MySQL' });
	if (!subject) {
		throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Skill not found');
	}
	const modulesData = [
		{
			name: 'Advanced SQL Queries',
			description: 'Learn advanced SQL query techniques for data retrieval and manipulation',
			video: 'advanced_sql_queries.mp4',
			estimated_time: 4,
			check_point_quizzes: [
				{
					question: 'Which SQL keyword is used to retrieve data from multiple tables?',
					correct_answer: 2,
					check_time: 3,
					answers: [
						{ text: 'JOIN', value: 0 },
						{ text: 'SELECT', value: 1 },
						{ text: 'INNER JOIN', value: 2 },
					],
				},
			],
		},
		{
			name: 'Database Design and Optimization',
			description: 'Explore techniques for designing and optimizing database schemas in MySQL',
			video: 'db_design_optimization.mp4',
			estimated_time: 4,
			check_point_quizzes: [
				{
					question: 'What is normalization in database design?',
					correct_answer: 0,
					check_time: 3,
					answers: [
						{ text: 'The process of organizing data to minimize redundancy', value: 0 },
						{ text: 'The process of adding redundancy to improve performance', value: 1 },
						{ text: 'The process of denormalizing data for easier querying', value: 2 },
					],
				},
			],
		},
		{
			name: 'Stored Procedures and Functions',
			description: 'Learn how to create and use stored procedures and functions in MySQL',
			video: 'stored_procedures_functions.mp4',
			estimated_time: 4,
			check_point_quizzes: [
				{
					question: 'What is a stored procedure in MySQL?',
					correct_answer: 1,
					check_time: 3,
					answers: [
						{ text: 'A query used to retrieve data from a database', value: 0 },
						{ text: 'A precompiled set of SQL statements for execution', value: 1 },
						{ text: 'A function used to perform calculations on data', value: 2 },
					],
				},
			],
		},
		{
			name: 'Transaction Management',
			description: 'Understand transaction concepts and techniques for managing transactions in MySQL',
			video: 'transaction_management.mp4',
			estimated_time: 4,
			check_point_quizzes: [
				{
					question: 'What is a transaction in MySQL?',
					correct_answer: 2,
					check_time: 3,
					answers: [
						{ text: 'A single SQL statement', value: 0 },
						{ text: 'A session with the MySQL server', value: 1 },
						{ text: 'A unit of work that is executed as a single, atomic operation', value: 2 },
					],
				},
			],
		},
		{
			name: 'Security and User Management',
			description: 'Learn about security features and user management in MySQL databases',
			video: 'security_user_management.mp4',
			estimated_time: 4,
			check_point_quizzes: [
				{
					question: 'What is the purpose of the GRANT statement in MySQL?',
					correct_answer: 0,
					check_time: 3,
					answers: [
						{ text: 'To assign privileges to MySQL users', value: 0 },
						{ text: 'To revoke privileges from MySQL users', value: 1 },
						{ text: 'To create new MySQL users', value: 2 },
					],
				},
			],
		},
	];


	Module.insertMany(modulesData)
  .then(modules => {
    // Create course
    const courseData = {
			title: 'Intermediate MySQL Database Management',
      description: 'A course covering intermediate level MySQL database management concepts and techniques',
      skill_tags: [{ skill: subject._id, level: 'Intermediate' }],
      modules: modules.map(module => module._id), // Store module ids in course
    };

    // Save course to MongoDB
    return Course.create(courseData);
  })
  .then(course => {
    console.log('Course with Web for advanced level tag seeded successfully:', course);
  })
  .catch(error => {
    console.error('Error seeding course:', error);
  });
}

module.exports = {
  getCourse,
  updateModuleProgress,
  getUserCourse,
	createCourse,
	addModuleToCourse,
	getCourses,
	findCourseById,
	seedLearningData,
  updateCourseInfo,
};

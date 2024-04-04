const httpStatus = require('http-status');
const { User, UserProfile, Job, JobEducation } = require('../models');
const ApiError = require('../utils/ApiError');
const JobRequirement = require('../models/jobRequirement.model');

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

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

const getUserProfile = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  let profile = await UserProfile.findOne({user: userId}).populate('skills.skill');
  let candidate = {...user.toObject()};
  if (profile) {
    candidate = {...user.toObject(), ...profile.toObject()};
  }

  return {
    candidate,
  }
}

const updateUserProfile = async (userId, body) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  let profile = await UserProfile.findOne({user: userId});
  if (!profile) {
    profile = await UserProfile.create({user: userId});
  }

  const skills = JSON.parse(body.skills);
  const beginnerSkills = skills.beginner.map((item) => {
    return {
      level: 'Beginner',
      skill: item,
    }
  })
  const intermediateSkills = skills.intermediate.map((item) => {
    return {
      level: 'Intermediate',
      skill: item,
    }
  })
  const advancedSkills = skills.advanced.map((item) => {
    return {
      level: 'Advanced',
      skill: item,
    }
  })
  const skillData = [].concat(beginnerSkills).concat(intermediateSkills).concat(advancedSkills);
  if (body?.educations) {
    profile.educations = body?.educations;
  }
  if (body?.certificates) {
    profile.certificates = body?.certificates;
  }
  if (skillData) {
    profile.skills = skillData;
  }
  if (body?.jobs) {
    profile.working_experiences = body?.jobs;
  }
  profile.introduction = body?.strength;

  await profile.save();
  return {candidate: {...user.toObject(), ...profile.toObject()}}
}

const findJob = async (body, query) => {
  let jobData = await Job.paginate({}, query);
  let jobs = jobData.results;
  let jobIds = jobs.map(item => item.id);
  if (!jobIds.length) jobIds = jobs.map(item => item._id);
  const jobRequirements = await JobRequirement.find({job: { $in: jobIds }}).populate('skills certificates majors colleges');
  const educations = await JobEducation.find({job: { $in: jobIds }});
  jobs = jobs.map(job => {
		const education = educations.find(edu => edu.job.toString() == job._id.toString());
		const requirements = jobRequirements.filter(re => re.job.toString() == job._id.toString());
    const previewSkills = requirements.filter(item => item.type === 'Skill').map(obj => obj.skills);

		return {
				...job.toObject(), // Convert Mongoose document to plain JavaScript object
				date_start: job.date_start ? formatDate(job.date_start) : null,
				date_end: job.date_start ? addMonthsToDate(job.date_start, job.display_month) : null,
				max_education_month: education ? education.max_education_month : null,
				scholarship: education ? education.scholarship : null,
				id: job._id,
        requirements,
        previewSkills,
		};
	});
  return {
		data: jobs,
		meta: {
			total: jobs.length,
			current_page: 1,
			per_page: 10,
		}
	};
}

const jobMatchingPoint = async (user_id, job_id) => {
	const profile = await UserProfile.findOne({user: user_id});
	const jobRequirement = await JobRequirement.find({job: job_id});

	let userPoint = 0;
	let jobPoint = jobRequirement.length;
	if (jobPoint > 0) {
		jobRequirement.forEach((requirement) => {
			if (requirement.skills && requirement.skills.length > 0) {
				profile.skills.forEach((userSkill) => {
					if (requirement.skills.include(userSkill.skill)) {
						userPoint += skillLevelCompare(requirement.level, userSkill.level);
					}
				})
			}
			else if (requirement.certificates && requirement.certificates.length > 0) {
				profile.certificates.forEach((userCertificate) => {
					if (requirement.certificates.include(userCertificate.certificate)) {
						userPoint += 1;
					}
				})
			}
			else if (requirement.major && requirement.major.length > 0) {
				profile.majors.forEach((userMajor) => {
					if (requirement.majors.include(userMajor.major)) {
						userPoint += 1;
					}
				})
			}
			else if (requirement.college && requirement.college.length > 0) {
				profile.colleges.forEach((userCollege) => {
					if (requirement.colleges.include(userCollege.college)) {
						userPoint += 1;
					}
				})
			}
		})
	}

	return userPoint / jobPoint;
}

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  getUserProfile,
  updateUserProfile,
	jobMatchingPoint,
  findJob,
};

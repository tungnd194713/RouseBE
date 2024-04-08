const httpStatus = require('http-status');
const { User, UserProfile, Job, JobEducation, CertificateSubjects, CollegeSubjects, JobRequirement, Subject } = require('../models');
const ApiError = require('../utils/ApiError');

function skillLevelCompare(requirementLevel, profileLevel) {
	if (requirementLevel == 'Advanced') {
		if (profileLevel == 'Advanced') return 1;
		if (profileLevel == 'Intermediate') return 0.5;
		if (profileLevel == 'Beginner') return 0.25;
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

// Function to remove duplicates based on skill with higher level preference
function removeDuplicates(array) {
  const map = new Map();

  // Iterate over each object in the array
  for (const obj of array) {
      // Convert mongoose ObjectId to string for comparison
      const skillString = obj.skill.toString();
      // If map already contains an object with the same skill
      if (map.has(skillString)) {
          const existingObj = map.get(skillString);
          // Compare levels and keep the one with higher preference
          if (getLevelIndex(obj.level) < getLevelIndex(existingObj.level)) {
              continue; // Skip current object if the existing one has a higher level
          }
      }
      // If no duplicate found or current object has higher level, update map
      map.set(skillString, obj);
  }

  // Return array of unique objects
  return Array.from(map.values());
}


// Function to get the index of the level based on its priority
function getLevelIndex(level) {
  switch (level) {
      case 'Beginner':
          return 0;
      case 'Intermediate':
          return 1;
      case 'Advanced':
          return 2;
      default:
          return -1; // If level is not recognized, return -1
  }
}

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

function getIndexOfMax(numbers) {
  let maxNumber = -Infinity;
  let maxIndex = -1;

  for (let i = 0; i < numbers.length; i++) {
    if (numbers[i] > maxNumber) {
      maxNumber = numbers[i];
      maxIndex = i;
    }
  }

  return maxIndex;
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

const suggestLogic = (jobRequirements, userSubjects, certificateIds, majorIds, certificateObjects, majorObjects) => {
	let jobPoint = 0;
	let userJobPoint = 0;
	const needToLearnSkill = [];
	const certificateRequirements = jobRequirements.filter((item) => item.type === 'Certificate').map((item) => item.certificates.map((iitem) => iitem.id));
	const majorRequirements = jobRequirements.filter((item) => item.type === 'Major').map((item) => item.majors.map((iitem) => iitem.id));
	const skillRequirements = jobRequirements.filter((item) => item.type === 'Skill').map((item) => {
		return {
			skills: item.skills,
			level: item.level,
		}
	}).map((item) => {
		return {
			skills: item.skills.map((iitem) => iitem.id),
			level: item.level
		}
	});
	certificateRequirements.forEach((certificates) => {
		let currentCertificatePoint = 0;
		let isSuitableCertificate = false;
		let cerPointArr = [];
		let cerLearn = [];
		certificates.forEach((certificate) => {
			let cerN = [];
			let userP = 0;
			const cerObjects = certificateObjects.find((item) => item.certificate.toString() === certificate.toString());
			const subObjects = cerObjects.subject_objects;
			const subPoint = subObjects.length;
			if (!isSuitableCertificate) {
				if (certificateIds.includes(certificate)) {
					userJobPoint += subPoint;
					currentCertificatePoint = subPoint;
					isSuitableCertificate = true;
				} else {
					subObjects.forEach((sub_object) => {
						let isMatched = false;
						userSubjects.forEach((user_item) => {
							if (!isMatched) {
								if (user_item.skill.toString() === sub_object.subject.toString()) {
									isMatched = true;
									let compared = skillLevelCompare(sub_object.level, user_item.level)
									userP += compared;
									if (compared < 1) {
										cerN.push({
											level: sub_object.level,
											skill: sub_object.subject
										});
									}
								}
							}
						})
						if (!isMatched) {
							cerN.push({
								level: sub_object.level,
								skill: sub_object.subject
							});
						}
					})
					cerPointArr.push(userP / subPoint);
					cerLearn.push(removeDuplicates(cerN));
				}
			}
		})
		if (isSuitableCertificate) {
			jobPoint += currentCertificatePoint;
		} else {
			const index = getIndexOfMax(cerPointArr);
			if (index > -1) {
				const jobP = certificateObjects.find((item) => item.certificate.toString() === certificates[index].toString()).subject_objects.length;
				jobPoint += jobP
				userJobPoint += cerPointArr[index] * jobP;
				needToLearnSkill.push(cerLearn[index]);
			}
		}
	})
	majorRequirements.forEach((majors) => {
		let currentMajorPoint = 0;
		let isSuitableMajor = false;
		let majPointArr = [];
		let majLearn = [];
		majors.forEach((major) => {
			let majN = [];
			let userP = 0;
			const majObjects = majorObjects.find((item) => item.major.toString() === major.toString());
			const subObjects = majObjects.subject_objects;
			const subPoint = subObjects.length;
			if (!isSuitableMajor) {
				if (majorIds.includes(major)) {
					userJobPoint += subPoint;
					currentMajorPoint = subPoint;
					isSuitableMajor = true;
				} else {
					subObjects.forEach((sub_object) => {
						let isMatched = false;
						userSubjects.forEach((user_item) => {
							if (!isMatched) {
								if (user_item.skill.toString() === sub_object.subject.toString()) {
									isMatched = true;
									let compared = skillLevelCompare(sub_object.level, user_item.level)
									userP += compared;
									if (compared < 1) {
										majN.push({
											level: sub_object.level,
											skill: sub_object.subject
										});
									}
								}
							}
						})
						if (!isMatched) {
							majN.push({
								level: sub_object.level,
								skill: sub_object.subject
							})
						}
					})
					majPointArr.push(userP / subPoint);
					majLearn.push(removeDuplicates(majN));
				}
			}
		})
		if (isSuitableMajor) {
			jobPoint += currentMajorPoint;
		} else {
			const index = getIndexOfMax(majPointArr);
			if (index > -1) {
				const jobP = majorObjects.find((item) => item.major.toString() === majors[getIndexOfMax(majPointArr)].toString()).subject_objects.length;
				jobPoint += jobP
				userJobPoint += majPointArr[index] * jobP;
				needToLearnSkill.push(majLearn[getIndexOfMax(majPointArr)]);
			}
		}
	})
	skillRequirements.forEach((skills) => {
		let suitableSkill = false;
		const skillLevel = skills.level
		skills.skills.forEach((skill) => {
			userSubjects.forEach((user_item) => {
				if (!suitableSkill) {
					if (user_item.skill.toString() === skill.toString()) {
						let compared = skillLevelCompare(skillLevel, user_item.level)
						userJobPoint += compared;
						if (compared < 1) {
							needToLearnSkill.push({
								level: skillLevel,
								skill,
							});
						}
						suitableSkill = true;
					} else {
						needToLearnSkill.push({
							level: skillLevel,
							skill,
						});
					}
				}
			})
		})
		jobPoint += 1;
	})
	
	return {
		jobPoint,
		userJobPoint,
		needToLearnSkill,
	}
}

const suggestJobs = async (userId) => {
  const userProfile = await UserProfile.findOne({user: userId});
  let userSubjects = userProfile.skills;
  const certificateIds = userProfile.certificates.map((item) => item.certificate);
  const majorIds = userProfile.educations.map((item) => item.major);
  const certificateObjects = await CertificateSubjects.find({});
  const majorObjects = await CollegeSubjects.find({});
  let userCertificateSubjects = certificateObjects.filter((item) => certificateIds.includes(item.certificate))
                                                  .map((item) => item.subject_objects)
                                                  .flat()
                                                  .map((item) => {
                                                    return {
                                                      level: item.level,
                                                      skill: item.subject,
                                                      _id: item._id,
                                                    }
                                                  })
  let userMajorSubjects = majorObjects.filter((item) => majorIds.includes(item.major))
																			.map((item) => item.subject_objects)
																			.flat()
																			.map((item) => {
																				return {
																					level: item.level,
																					skill: item.subject,
																					_id: item._id,
																				}
																			})
  userSubjects = removeDuplicates(userSubjects.concat(userCertificateSubjects, userMajorSubjects));
  let availableJobs = await Job.find({ status: 1 });
  const jobIds = availableJobs.map((item) => item._id);
  const requirements = await JobRequirement.find({ job: { $in: jobIds } }).populate('skills certificates majors colleges');
  const educations = await JobEducation.find({job: { $in: jobIds }});
	
  availableJobs = availableJobs.map((job) => {
		const education = educations.find(edu => edu.job.toString() == job._id.toString());
    const jobRequirements = requirements.filter((item) => item.job.toString() === job._id.toString());
		const suggestResult = suggestLogic(jobRequirements, userSubjects, certificateIds, majorIds, certificateObjects, majorObjects);
    return {
      ...job.toObject(),
			date_start: job.date_start ? formatDate(job.date_start) : null,
			date_end: job.date_start ? addMonthsToDate(job.date_start, job.display_month) : null,
			max_education_month: education ? education.max_education_month : null,
			scholarship: education ? education.scholarship : null,
			id: job._id,
			requirements: jobRequirements,
      need_to_learn: removeDuplicates(suggestResult.needToLearnSkill.flat()),
      job_point: suggestResult.jobPoint,
      user_job_point: suggestResult.userJobPoint,
			matching_point: suggestResult.userJobPoint / suggestResult.jobPoint,
    }
  })

	availableJobs = availableJobs.sort((a, b) => b.matching_point - a.matching_point);

  return {
		data: availableJobs,
		meta: {
			total: availableJobs.length,
			current_page: 1,
			per_page: 10,
		}
	};
}

const getDetailJob = async (userId, jobId) => {
  const userProfile = await UserProfile.findOne({user: userId});
  let userSubjects = userProfile.skills;
	const certificateIds = userProfile.certificates.map((item) => item.certificate);
	const certificateObjects = await CertificateSubjects.find({});
  let userCertificateSubjects = certificateObjects.filter((item) => certificateIds.includes(item.certificate))
                                                  .map((item) => item.subject_objects)
                                                  .flat()
                                                  .map((item) => {
                                                    return {
                                                      level: item.level,
                                                      skill: item.subject,
                                                      _id: item._id,
                                                    }
                                                  })
  const majorObjects = await CollegeSubjects.find({});
  const majorIds = userProfile.educations.map((item) => item.major);
	const userMajorSubjects = majorObjects.filter((item) => majorIds.includes(item.major))
																				.map((item) => item.subject_objects)
																				.flat()
																				.map((item) => {
																					return {
																						level: item.level,
																						skill: item.subject,
																						_id: item._id,
																					}
																				})
	userSubjects = removeDuplicates(userSubjects.concat(userCertificateSubjects, userMajorSubjects));
	const job = await Job.findById(jobId);
  const education = await JobEducation.findOne({job: jobId });
	const jobRequirements = await JobRequirement.find({ job: jobId }).populate('skills certificates majors colleges');

	const suggestResult = suggestLogic(jobRequirements, userSubjects, certificateIds, majorIds, certificateObjects, majorObjects);
	const needToLearn = removeDuplicates(suggestResult.needToLearnSkill.flat());
	const needToLearnSkills = await Subject.find({_id: {$in: needToLearn.map(item => item.skill)}})
	const matchedLearning = needToLearnSkills.map(item1 => {
    const matchingItem = needToLearn.find(item2 => item2.skill.toString() === item1.id.toString());
    return {
        name: item1.name,
        ...matchingItem
    };
	});
	return {
		...job.toObject(),
		date_start: job.date_start ? formatDate(job.date_start) : null,
		date_end: job.date_start ? addMonthsToDate(job.date_start, job.display_month) : null,
		max_education_month: education ? education.max_education_month : null,
		scholarship: education ? education.scholarship : null,
		requirements: jobRequirements,
		id: job._id,
		need_to_learn: matchedLearning,
		job_point: suggestResult.jobPoint,
		user_job_point: suggestResult.userJobPoint,
	}
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
  suggestJobs,
	getDetailJob,
};

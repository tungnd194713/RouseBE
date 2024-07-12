const mongoose = require('mongoose');
const httpStatus = require('http-status');
const { User, UserProfile, Job, JobEducation, CertificateSubjects, CollegeSubjects, JobRequirement, Subject, Certificate, Major, CandidateApply, Course, UserRoadMap, Module, Discussion, Note, Mentor, MentorShift, MentorRating, Test, AnswerSheet, Company, CourseTransaction, ModuleProgressLog } = require('../models');
const ApiError = require('../utils/ApiError');

const convertHourToNumber = (hourString) => {
  const [hour, minute] = hourString.split(":").map(Number);
  return hour + minute / 60;
}

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
const getUserByEmail = async (email, role) => {
  return User.findOne({ email, role });
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
  profile.strength = body?.strength;
  profile.reason_apply = body?.reason_apply;

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
	let needToLearnSkill = [];
  const jobMatchingData = [];
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
    let userCer = [];
		certificates.forEach((certificate) => {
			let cerN = [];
      let userC = [];
			let userP = 0;
			const cerObjects = certificateObjects.find((item) => item.certificate.toString() === certificate.toString());
			const subObjects = cerObjects.subject_objects;
			const subPoint = subObjects.length;
			if (!isSuitableCertificate) {
				if (certificateIds.includes(certificate)) {
					userJobPoint += subPoint;
					currentCertificatePoint = subPoint;
					isSuitableCertificate = true;
          const matchedCertificate = certificateIds.find((item) => item.toString() === certificate.toString());
          jobMatchingData.push({
            jobRequirement: {
              type: 'Certificate',
              requirements: certificates,
            },
            userProfile: [{
              type: 'Certificate',
              id: matchedCertificate,
            }],
            matchingPoint: subPoint,
          })
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
                  if (user_item.certificate) {
                    userC.push({
                      type: 'Certificate',
                      id: user_item.certificate
                    })
                  }
                  else if (user_item.major) {
                    userC.push({
                      type: 'Major',
                      id: user_item.major
                    })
                  } else {
                    userC.push({
                      type: 'Skill',
                      id: user_item.skill,
                      level: user_item.level
                    })
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
          userCer.push(userC);
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
        jobMatchingData.push({
          jobRequirement: {
            type: 'Certificate',
            requirements: certificates,
          },
          userProfile: userCer[index],
          matchingPoint: cerPointArr[index] * jobP,
        })
			}
		}
	})
	majorRequirements.forEach((majors) => {
		let currentMajorPoint = 0;
		let isSuitableMajor = false;
		let majPointArr = [];
		let majLearn = [];
    let userCer = [];
		majors.forEach((major) => {
			let majN = [];
			let userP = 0;
      let userC = [];
			const majObjects = majorObjects.find((item) => item.major.toString() === major.toString());
			const subObjects = majObjects.subject_objects;
			const subPoint = subObjects.length;
      const matchedMajor = majorIds.find((item) => item.toString() === major.toString());
			if (!isSuitableMajor) {
				if (majorIds.includes(major)) {
					userJobPoint += subPoint;
					currentMajorPoint = subPoint;
					isSuitableMajor = true;
          jobMatchingData.push({
            jobRequirement: {
              type: 'Major',
              requirements: majors,
            },
            userProfile: [{
              type: 'Major',
              id: matchedMajor,
            }],
            matchingPoint: subPoint,
          })
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
                  if (user_item.certificate) {
                    userC.push({
                      type: 'Certificate',
                      id: user_item.certificate
                    })
                  }
                  else if (user_item.major) {
                    userC.push({
                      type: 'Major',
                      id: user_item.major
                    })
                  } else {
                    userC.push({
                      type: 'Skill',
                      id: user_item.skill,
                      level: user_item.level
                    })
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
          userCer.push(userC);
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
        jobMatchingData.push({
          jobRequirement: {
            type: 'Major',
            requirements: majors,
          },
          userProfile: userCer[index],
          matchingPoint: majPointArr[index] * jobP,
        })
			}
		}
	})
  needToLearnSkill = needToLearnSkill.flat();
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
						} else {
              needToLearnSkill = needToLearnSkill.filter((skill_item) => skill_item.skill.toString() !== skill.toString());
            }
						suitableSkill = true;
            jobMatchingData.push({
              jobRequirement: {
                type: 'Skill',
                requirements: skills.skills,
                level: skillLevel,
              },
              userProfile: [{
                type: 'Skill',
                id: user_item.skill,
                level: user_item.level
              }],
              matchingPoint: compared,
            })
					} else {
						needToLearnSkill.push({
							level: skillLevel,
							skill,
						});
					}
				}
			})
		})
    if (!suitableSkill) {
      jobMatchingData.push({
        jobRequirement: {
          type: 'Skill',
          requirements: skills.skills,
          level: skillLevel,
        },
        userProfile: [],
        matchingPoint: 0,
      })
    }
		jobPoint += 1;
	})

	return {
		jobPoint,
		userJobPoint,
		needToLearnSkill,
    jobMatchingData,
	}
}

const guestJobs = async (params, query) => {
  const body = {
    status: 1,
  }
  if (params.salary_min) {
    body.salary_min = { $gte: params.salary_min }
  }
  if (params.salary_max) {
    body.salary_max = { $gte: params.salary_max }
  }
  if (params.province_id) {
    body.salary_max = params.province_id
  }
  if (params.title?.trim()) {
    body.title = { "$regex": params.title.trim(), "$options": "i" }
  }

  const queryOptions = {
    ...query,
    populate: 'jobEducation,jobRequirements',
    sortBy: 'accept_education:desc,scholarship:desc'
  }

  const jobCollections = await Job.paginate(body, queryOptions);
  const jobIds = jobCollections.results.map((item) => item._id);
  const requirements = await JobRequirement.find({ job: { $in: jobIds } }).populate('skills certificates majors colleges');

  const availableJobs = jobCollections.results.map((job) => {
		const education = job.jobEducation?.length ? job.jobEducation[0] : job.jobEducation;
    const jobRequirements = requirements.filter((item) => item.job.toString() === job._id.toString());
    const previewSkills = requirements.filter(item => item.type === 'Skill').map(obj => obj.skills).slice(0, 3);

    return {
      ...job.toObject(),
			date_start: job.date_start ? formatDate(job.date_start) : null,
			date_end: job.date_start ? addMonthsToDate(job.date_start, job.display_month) : null,
      educationReady: (education && education.status === 3) ? true : false,
			max_education_month: (education && education.status === 3) ? education.max_education_month : null,
			scholarship: (education && education.status === 3) ? education.scholarship : null,
			id: job._id,
			requirements: jobRequirements,
      job_point: null,
      user_job_point: null,
			matching_point: 0,
      previewSkills,
    }
  })

  return {
		data: availableJobs,
		meta: {
			total: availableJobs.length,
			current_page: 1,
			per_page: 10,
		}
	};
}

const suggestJobs = async (userId, params) => {
  const userProfile = await UserProfile.findOne({user: userId});
  let userSubjects = userProfile?.skills || [];
  const certificateIds = userProfile?.certificates?.map((item) => item.certificate) || [];
  const majorIds = userProfile?.educations?.map((item) => item.major) || [];
  const certificateObjects = await CertificateSubjects.find({});
  const majorObjects = await CollegeSubjects.find({});
  let userCertificateSubjects = certificateObjects.filter((item) => certificateIds.includes(item.certificate))
                                                  .map((item) => item.subject_objects.map((iitem) => {
                                                    return {
                                                      ...iitem.toObject(),
                                                      certificate: item.certificate,
                                                    }
                                                  }))
                                                  .flat()
                                                  .map((item) => {
                                                    return {
                                                      level: item.level,
                                                      skill: item.subject,
                                                      _id: item._id,
                                                      certificate: item.certificate,
                                                    }
                                                  })
  let userMajorSubjects = majorObjects.filter((item) => majorIds.includes(item.major))
                                      .map((item) => item.subject_objects.map((iitem) => {
                                        return {
                                          ...iitem.toObject(),
                                          major: item.major,
                                        }
                                      }))
                                      .flat()
                                      .map((item) => {
                                        return {
                                          level: item.level,
                                          skill: item.subject,
                                          _id: item._id,
                                          major: item.major,
                                        }
                                      })
  userSubjects = removeDuplicates(userSubjects.concat(userCertificateSubjects, userMajorSubjects));
  const query = {
    status: 1,
  }
  if (params.salary_min) {
    query.salary_min = { $gte: params.salary_min }
  }
  if (params.salary_max) {
    query.salary_max = { $gte: params.salary_max }
  }
  if (params.province_id) {
    query.salary_max = params.province_id
  }
  if (params.title?.trim()) {
    query.title = { "$regex": params.title.trim(), "$options": "i" }
  }
  let availableJobs = await Job.find(query);
  const jobIds = availableJobs.map((item) => item._id);
  const requirements = await JobRequirement.find({ job: { $in: jobIds } }).populate('skills certificates majors colleges');
  const educations = await JobEducation.find({job: { $in: jobIds }});

  availableJobs = availableJobs.map((job) => {
		const education = educations.find(edu => edu.job.toString() === job._id.toString());
    const jobRequirements = requirements.filter((item) => item.job.toString() === job._id.toString());
    const previewSkills = requirements.filter(item => item.type === 'Skill').map(obj => obj.skills).slice(0, 3);

		const suggestResult = suggestLogic(jobRequirements, userSubjects, certificateIds, majorIds, certificateObjects, majorObjects);
    return {
      ...job.toObject(),
			date_start: job.date_start ? formatDate(job.date_start) : null,
			date_end: job.date_start ? addMonthsToDate(job.date_start, job.display_month) : null,
      educationReady: (education && education.status === 3) ? true : false,
			max_education_month: (education && education.status === 3) ? education.max_education_month : null,
			scholarship: (education && education.status === 3) ? education.scholarship : null,
			id: job._id,
			requirements: jobRequirements,
      need_to_learn: removeDuplicates(suggestResult.needToLearnSkill.flat()),
      job_point: userProfile ? suggestResult.jobPoint : null,
      user_job_point: userProfile ? suggestResult.userJobPoint : null,
			matching_point: suggestResult.userJobPoint / suggestResult.jobPoint,
      previewSkills,
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
  let userSubjects = userProfile?.skills || [];
	const certificateIds = userProfile?.certificates?.map((item) => item.certificate) || [];
	const certificateObjects = await CertificateSubjects.find({});
  let userCertificateSubjects = certificateObjects.filter((item) => certificateIds.includes(item.certificate))
                                                  .map((item) => item.subject_objects.map((iitem) => {
                                                    return {
                                                      ...iitem.toObject(),
                                                      certificate: item.certificate,
                                                    }
                                                  }))
                                                  .flat()
                                                  .map((item) => {
                                                    return {
                                                      level: item.level,
                                                      skill: item.subject,
                                                      _id: item._id,
                                                      certificate: item.certificate,
                                                    }
                                                  })
  const majorObjects = await CollegeSubjects.find({});
  const majorIds = userProfile?.educations?.map((item) => item.major) || [];
	const userMajorSubjects = majorObjects.filter((item) => majorIds.includes(item.major))
                                        .map((item) => item.subject_objects.map((iitem) => {
                                          return {
                                            ...iitem.toObject(),
                                            major: item.major,
                                          }
                                        }))
                                        .flat()
                                        .map((item) => {
                                          return {
                                            level: item.level,
                                            skill: item.subject,
                                            _id: item._id,
                                            major: item.major,
                                          }
                                        })
	userSubjects = removeDuplicates(userSubjects.concat(userCertificateSubjects, userMajorSubjects));
	const job = await Job.findById(jobId).populate('company_id');
	const jobRequirements = await JobRequirement.find({ job: jobId }).populate('skills certificates majors colleges');
  const beginnerSkills = jobRequirements.filter(item => item.type === 'Skill' && item.level === 'Beginner').map(obj => obj.skills);
  const intermediateSkills = jobRequirements.filter(item => item.type === 'Skill' && item.level === 'Intermediate').map(obj => obj.skills);
  const advancedSkills = jobRequirements.filter(item => item.type === 'Skill' && item.level === 'Advanced').map(obj => obj.skills);
  const certificates = jobRequirements.filter(item => item.type === 'Certificate').map(obj => obj.certificates);
  const majorColleges = jobRequirements.filter(item => item.type === 'Major').map(obj => {
    return {
      majors: obj.majors,
      colleges: obj.colleges
    }
  });
  const previewSkills = jobRequirements.filter(item => item.type === 'Skill').map(obj => obj.skills).slice(0, 3).flat().map(item => item.name);

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
  const jobMatchingData = suggestResult.jobMatchingData;

  let jobMatchingDataFinal = [];
  let allIds = new Set();
  jobMatchingData.forEach(doc => {
      doc.jobRequirement.requirements.forEach(req => allIds.add(req.toString()));
      doc.userProfile.forEach(profile => allIds.add(profile.id.toString()));
  });

  allIds = Array.from(allIds); // Convert Set to Array for easier processing

  // Retrieve certificates, majors, and skills data by IDs
  const convertedCertificate = await Certificate.find({ _id: { $in: allIds } });
  const convertedMajor = await Major.find({ _id: { $in: allIds } });
  const convertedSkill = await Subject.find({ _id: { $in: allIds } });

  // Map data by ID for efficient lookup
  const certificatesMap = new Map(convertedCertificate.map(cert => [cert._id.toString(), cert]));
  const majorsMap = new Map(convertedMajor.map(major => [major._id.toString(), major]));
  const skillsMap = new Map(convertedSkill.map(skill => [skill._id.toString(), skill]));

  // Match data with the original documents
  jobMatchingData.forEach(doc => {
    const newDoc = {
      jobRequirement: {
        type: doc.jobRequirement.type,
        requirements: [],
      },
      userProfile: [],
      matchingPoint: doc.matchingPoint
    };
    if (doc.jobRequirement.level) {
      newDoc.jobRequirement.level = doc.jobRequirement.level;
    }
      doc.jobRequirement.requirements.forEach(req => {
        const newRequirement = {}
        switch (doc.jobRequirement.type) {
          case 'Certificate':
              const certificateData = certificatesMap.get(req);
              newDoc.jobRequirement.type = 'Certificate';
              newRequirement.id = req
              newRequirement.name = certificateData ? certificateData.name : ''
              break;
          case 'Major':
              const majorData = majorsMap.get(req);
              newDoc.jobRequirement.type = 'Major';
              newRequirement.id = req
              newRequirement.name = majorData ? majorData.name : ''
              break;
          case 'Skill':
              const skillData = skillsMap.get(req);
              newDoc.jobRequirement.type = 'Skill';
              newRequirement.id = req
              newRequirement.name = skillData ? skillData.name : ''
              break;
          default:
              break;
        }
        newDoc.jobRequirement.requirements.push(newRequirement)
      });
      doc.userProfile.forEach(profile => {
          switch (profile.type) {
              case 'Certificate':
                  const certificateData = certificatesMap.get(profile.id.toString());
                  newDoc.userProfile.push({
                    ...profile,
                    name: certificateData ? certificateData.name : '',
                  })
                  break;
              case 'Major':
                  const majorData = majorsMap.get(profile.id.toString());
                  newDoc.userProfile.push({
                    ...profile,
                    name: majorData ? majorData.name : '',
                  })
                  break;
              case 'Skill':
                  const skillData = skillsMap.get(profile.id.toString());
                  newDoc.userProfile.push({
                    ...profile,
                    name: skillData ? skillData.name : '',
                    level: profile?.level
                  })
                  break;
              default:
                  break;
          }
      });
      jobMatchingDataFinal.push(newDoc)
   });

  jobMatchingDataFinal.forEach(obj => {
    const userProfile = obj.userProfile;
    const uniqueUserProfiles = userProfile.reduce((acc, current) => {
      const existing = acc.find(item => item.id === current.id);
      if (!existing) {
          acc.push(current);
      }
      return acc;
    }, []);
    obj.userProfile = uniqueUserProfiles;
  });

  const isApplied = await CandidateApply.findOne({ job: jobId, user: userId });

  const education = await JobEducation.findOne({job: jobId })
  .populate({
    path: 'courses',
    populate: {
      path: 'modules',
      model: 'Module',
    },
  })
  .populate({
    path: 'courses',
    populate: {
      path: 'tests',
      populate: {
        path: 'questions',
        model: 'Question'
      },
    },
  });
  if (!education || education.status !== 3) {
    return {
      ...job.toObject(),
      date_start: job.date_start ? formatDate(job.date_start) : null,
      date_end: job.date_start ? addMonthsToDate(job.date_start, job.display_month) : null,
      id: job._id,
      need_to_learn: matchedLearning,
      job_point: userProfile ? suggestResult.jobPoint : null,
      user_job_point: userProfile ? suggestResult.userJobPoint : null,
      job_matching_data: jobMatchingDataFinal,
      beginnerSkills,
      intermediateSkills,
      advancedSkills,
      certificates,
      majorColleges,
      previewSkills,
      isApplied: isApplied ? true : false,
      educationReady: false,
      company: job.company_id,
    }
  }
  let userRoadmaps = await UserRoadMap.find({ user: userId });
  const doneCourses = userRoadmaps.map((roadmap) => roadmap.done_courses.map((course) => course.toString())).flat();

  const roadmapCourses = [];
	education.courses.forEach((course) => {
    const timeCost = course.modules.reduce((acc, module) => acc + module.estimated_time, 0);
    const item = matchedLearning.find((tag) => tag.skill.toString() === course.skill_tags[0].skill.toString() && tag.level === course.skill_tags[0].level);
    let courseLearned = false;
    if (doneCourses.includes(course.id.toString()) || doneCourses.includes(course._id.toString())) {
      courseLearned = true;
    }
    if (item) {
      roadmapCourses.push({
        ...course.toObject(),
        id: course._id || course.id,
        _id: course._id || course.id,
        timeCost,
        tag: {
          name: item,
        },
        courseLearned,
      });
    }
  });

	const needToLearnCourses = [];
	matchedLearning.forEach((item) => {
		const foundCourse = roadmapCourses.find((course) => {
			const foundTag = course.skill_tags.find((tag) => tag.skill.toString() === item.skill.toString() && tag.level === item.level);
			if (foundTag) {
				return true;
			} else {
				return false;
			}
		})
		if (foundCourse) {
			const timeCost = foundCourse.modules.reduce((acc, module) => acc + module.estimated_time, 0);
			needToLearnCourses.push({
				...foundCourse,
        _id: foundCourse.id || foundCourse._id,
        id: foundCourse.id || foundCourse._id,
				timeCost,
				tag: item,
			})
		}
	})

	return {
		...job.toObject(),
		date_start: job.date_start ? formatDate(job.date_start) : null,
		date_end: job.date_start ? addMonthsToDate(job.date_start, job.display_month) : null,
		id: job._id,
		need_to_learn: matchedLearning,
		job_point: userProfile ? suggestResult.jobPoint : null,
		user_job_point: userProfile ? suggestResult.userJobPoint : null,
		job_matching_data: jobMatchingDataFinal,
    beginnerSkills,
    intermediateSkills,
    advancedSkills,
    certificates,
    majorColleges,
    previewSkills,
    isApplied: isApplied ? true : false,
    educationReady: true,
    max_education_month: education ? education.max_education_month : null,
		scholarship: education ? education.scholarship : null,
    needToLearnCourses: roadmapCourses?.filter((item) => !item.courseLearned) || [],
    roadmapCourses,
    company: job.company_id,
	}
}

const applyJob = async (user_id, body) => {
  const job = await Job.findById(body.job);
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }
  const isApplied = await CandidateApply.findOne({ job: body.job, user: user_id });
  if (isApplied) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Already applied');
  }
  return CandidateApply.create({
    ...body,
    user: user_id,
    company: job.company_id
  })
}

const getAppliedJobs = async (user_id, options, params) => {
  const filter = {
    user: user_id,
  }
  const queryOptions = {
		...options,
    populate: 'job'
	}
  if (params && params.status) {
    filter.status = params.status;
  }
  return CandidateApply.paginate(filter, queryOptions);
}

const checkJobEducationExisted = async (userId) => {
	return UserRoadMap.findOne({ user: userId, is_finished: false });
}

const startJobEducation = async (userId, candidateApplyId) => {
  const candidateApply = await CandidateApply.findById(candidateApplyId).populate('job');
  if (!candidateApply) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CV not found');
  }
  if (candidateApply.user.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not authorized');
  }
  if (candidateApply.education_applied !== 1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to start education');
  }
  if (!candidateApply.education_courses || !candidateApply.education_courses.length) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to start education');
  }
	if (candidateApply.status === 3) {
    const jobEducation = await JobEducation.findOne({ job: candidateApply.job });
    if (!jobEducation) throw new ApiError(httpStatus.NOT_FOUND, 'Education not found');

    // const currentCourse = await Course.findById(candidateApply.education_courses[0]);
    const userRoadmap = {
      title:'Lộ trình học cho vị trí ' + candidateApply.job.title,
      user: userId,
      job: candidateApply.job.id,
      jobEducation: jobEducation.id || jobEducation._id,
      // current_course: candidateApply.education_courses[0],
      // current_module: currentCourse?.modules[0],
      scholarship: jobEducation.scholarship || 0,
      roadmap_milestone: candidateApply.education_courses.map((item) => {
        return {
          course: item,
          is_skipped: false,
          skippable: true,
          progress: 0,
          is_finished: false,
        }
      }),
      applied_date: Date.now(),
      is_finished: false,
    };
    const createdRoadmap = await UserRoadMap.create(userRoadmap);
    if (!createdRoadmap) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Something wrong');
    }
    candidateApply.status = 4;
    await candidateApply.save()
    return createdRoadmap.id || createdRoadmap._id;
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, 'Unable to start education');
  }
}

const refuseJobEducation = async (userId, candidateApplyId) => {
  const candidateApply = await CandidateApply.findById(candidateApplyId).populate('job');
  if (!candidateApply) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CV not found');
  }
  if (candidateApply.user.toString() !== userId.toString()) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not authorized');
  }

  if (candidateApply.status === 3) {
    candidateApply.status = 8;
    await candidateApply.save()
    return 'Education refused';
  }
}

const getCurrentEducation = async (userId) => {
  const userRoadmap = await UserRoadMap.findOne({ user: userId, is_finished: false })
  .populate('current_course current_module roadmap_milestone.course')
  .populate({
    path: 'roadmap_milestone.course',
    populate: {
      path: 'modules',
      model: 'Module',
    },
  })
  .populate({
    path: 'roadmap_milestone.course',
    populate: {
      path: 'tests',
      model: 'Test',
    },
  });
  if (!userRoadmap) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Roadmap not found');
  }
  const courseIds = userRoadmap.roadmap_milestone.map((item) => new mongoose.Types.ObjectId(item.course._id));
  const mentorShifts = await MentorShift.aggregate([
    {
      $match: {
        user: userId,
        course: { $in: courseIds }
      }
    },
    {
      $lookup: {
        from: 'mentors', // name of the Mentor collection
        localField: 'mentor',
        foreignField: '_id',
        as: 'mentor'
      }
    },
    {
      $unwind: '$mentor'
    },
    {
      $lookup: {
        from: 'mentorratings', // name of the MentorRating collection
        localField: 'mentor._id',
        foreignField: 'mentor',
        as: 'mentor.ratings'
      }
    }
  ]);
  const job = await Job.findById(userRoadmap.job).select('id title');
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }
  const jobEducation = await JobEducation.findOne({job: job.id});
  if (!jobEducation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job education not found');
  }
  const roadmapProgress = getUserRoadmapProgress(userRoadmap);

  const courses = userRoadmap.roadmap_milestone.map((item) => item.course);
  const testIds = courses.map((item) => item.tests).flat();
  const answersheets = await AnswerSheet.find({ testId: { $in: testIds }, user: userId })

  const roadmapData = userRoadmap.roadmap_milestone.toObject().map((item) => {
    const testResults = [];
    item.course.tests?.forEach((test) => {
      const answerSheet = answersheets.find((sheet) => sheet.testId.toString() === test._id.toString());
      if (answerSheet) {
        testResults.push({
          answerSheet,
          test,
          isFinished: answerSheet.isFinished,
        })
      } else {
        testResults.push({
          test,
          isFinished: false,
        })
      }
    })
    return {
      ...item,
      tests: testResults,
    }
  })

  return {
    userRoadmap: {
      ...userRoadmap.toObject(),
      roadmap_milestone: roadmapData,
    },
    job: job.toObject(),
    jobEducation: jobEducation.toObject(),
    roadmapProgress,
    mentorShifts,
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

const getUserRoadmapProgress = (userRoadmap) => {
  let totalDoneModule = 0;
  let totalModules = 0;
  userRoadmap.roadmap_milestone.forEach((milestone) => {
    totalModules += milestone.course.modules.length;
    totalDoneModule += milestone.is_finished ? milestone.course.modules.length : milestone.done_modules.length;
  })

  return totalDoneModule / totalModules * 100;
}

const getUserModule = async (userId, roadmapId, courseId, moduleId) => {
  const userRoadmap = await UserRoadMap.findById(roadmapId);

  if (!userRoadmap) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Roadmap not found');
  }

	const roadmapCourse = userRoadmap.roadmap_milestone?.find((item) => item.course.toString() === courseId.toString());

  if (!roadmapCourse || !roadmapCourse.is_unlocked) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  if (!course.modules.find((item) => item.toString() === moduleId.toString())) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');
  }

  const moduleData = await Module.findById(moduleId);
  const discussion = await Discussion.find({ module_id: moduleId })
  .populate('user_id', 'name')
  .populate({
    path: 'discussionReplies',
    populate: {
      path: 'user_id', // Populate the user properties in each discussionReply
      model: 'User',
    },
  });
  const noteList = await Note.find({ module_id: moduleId, user_id: userId });
	const moduleProgressLog = await ModuleProgressLog.findOne({ video_update_time: { $ne: 0 }, module: moduleId }).sort({ createdAt: -1 });
  return {
    userRoadmap,
    course,
    moduleData: moduleData.toObject(),
		currentVideoTime: moduleProgressLog ? (moduleProgressLog.video_update_time ? moduleProgressLog.video_update_time : 0) : 0,
    discussion: discussion,
    noteList: noteList,
  }
}

const watchedModule = async (userId, roadmapId, courseId, moduleId) => {
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');

  if (!course.modules.find((item) => item.toString() === moduleId.toString())) throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');

  const module = await Module.findById(moduleId);
  if (!module) throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');

  const userRoadmap = await UserRoadMap.findById(roadmapId);

  if (!userRoadmap) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Roadmap not found');
  }

  const roadmapCourse = userRoadmap.roadmap_milestone?.find((item) => item.course.toString() === courseId.toString());

  if (!roadmapCourse || !roadmapCourse.is_unlocked) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  const filter = {
    _id: userRoadmap.id || userRoadmap._id,
    user: userId,
    'roadmap_milestone.course': courseId,
  };

  const update = {
    $addToSet: {
      'roadmap_milestone.$.done_modules': moduleId,
    },
    current_module: moduleId,
    current_course: courseId,
  };

  await UserRoadMap.findOneAndUpdate(filter, update);
  return 'Module done';
}

const unlockRoadmapCourse = async (userId, roadmapId, courseId, body) => {
	const userRoadmap = await UserRoadMap.findById(roadmapId).populate('job');

	if (!userRoadmap) throw new ApiError(httpStatus.NOT_FOUND, 'Roadmap not found');

	if (!userRoadmap.roadmap_milestone?.find((item) => item.course.toString() === courseId.toString())) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }

	const milestoneIndex = userRoadmap.roadmap_milestone.findIndex(milestone => milestone.course.equals(courseId));
	// Check if the milestone with the specified course_id exists
	if (milestoneIndex !== -1) {
		// Update the is_unlocked property of the milestone
    const user = await User.findById(userId);
    const point_cost = course.point_cost * ((100 - userRoadmap.scholarship) / 100);
		let transaction = null;
    if (user.point_owned < point_cost) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient point');
    } else {
      userRoadmap.roadmap_milestone[milestoneIndex].is_unlocked = true; // Set newValue to your desired boolean value
      userRoadmap.roadmap_milestone[milestoneIndex].started_at = new Date(Date.now()); // Set newValue to your desired boolean value
      user.point_owned = user.point_owned - point_cost;
      await userRoadmap.save();
      await user.save();

			transaction = await CourseTransaction.create({
				user: userId,
				course: courseId,
				jobEducation: userRoadmap.jobEducation,
				paid_point: point_cost,
				course_point: course.point_cost,
				scholarship: userRoadmap.scholarship,
			})
    }

		const company = await Company.findById(userRoadmap.job.company_id);
		const scholarship_cost = course.point_cost * (userRoadmap.scholarship / 100)
		if (company.point_owned < scholarship_cost) {
			transaction.scholarship_paid = false;
			await transaction.save();
		} else {
			company.point_owned -= scholarship_cost;
      transaction.scholarship_paid_at = Date.now();
			await transaction.save();
		}
		await company.save();
	} else {
		throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
	}

  if (body.request_mentor) {
    // body = {
    //   mentor_data: [
    //     {
    //       mentorId: id,
    //       weekday: { day: "monday", start_hour: new Date("2024-05-09T08:00:00"), end_hour: new Date("2024-05-09T10:00:00") },
    //     },
    //     {
    //       mentorId: id,
    //       weekday: { day: "tuesday", start_hour: new Date("2024-05-10T10:00:00"), end_hour: new Date("2024-05-10T12:00:00") },
    //     }
    //   ]
    // }
    const shift_data = JSON.parse(body.mentor_data)
    const createData = [];
    shift_data.forEach((item) => {
      const shift_days = {};
      const weekday = item.weekday
      shift_days[weekday.day] = {
        start_hour: convertHourToNumber(weekday.start_hour),
        end_hour: convertHourToNumber(weekday.end_hour),
      }
      const shiftData = {
        user: userId,
        course: courseId,
        mentor: item.mentorId,
        is_finished: false,
        shift_days,
        status: 1,
        day_of_week: weekday.day,
      }
      createData.push(shiftData);
    })
    try {
      await MentorShift.insertMany(createData);
      return 'Mentor assigned';
    } catch (e) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
    }
  }
	return 'Course unlocked';
}

const requestMentor = async (userId, courseId, body) => {
  // body = {
  //   mentor_data: [
  //     {
  //       mentorId: id,
  //       weekday: { day: "monday", start_hour: new Date("2024-05-09T08:00:00"), end_hour: new Date("2024-05-09T10:00:00") },
  //     },
  //     {
  //       mentorId: id,
  //       weekday: { day: "tuesday", start_hour: new Date("2024-05-10T10:00:00"), end_hour: new Date("2024-05-10T12:00:00") },
  //     }
  //   ]
  // }
  const user = await User.findById(userId);
  if (!user) throw new ApiError(httpStatus.BAD_REQUEST, 'User not found');

  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(httpStatus.BAD_REQUEST, 'Course not found');

  const shift_data = JSON.parse(body.mentor_data)
  const createData = [];
  shift_data.forEach((item) => {
    const shift_days = {};
    shift_days[item.weekday.day] = {
      start_hour: convertHourToNumber(item.weekday.start_hour),
      end_hour: convertHourToNumber(item.weekday.end_hour),
    }
    const shiftData = {
      user: userId,
      course: courseId,
      mentor: item.mentorId,
      is_finished: false,
      status: 1,
      shift_days,
      day_of_week: item.weekday.day,
    }
    createData.push(shiftData);
  })
  try {
    await MentorShift.insertMany(createData);
    return 'Mentor assigned';
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e);
  }
}

const addMentorRating = async (userId, body) => {
  const mentorShift = await MentorShift.findOne({ user: userId, course: body.course, mentor: body.mentor });
  if (!mentorShift) throw new ApiError(httpStatus.BAD_REQUEST, 'Shift not found');

  let rating = await MentorRating.findOne({ user: userId, mentor: body.mentor, course: body.course, mentorShift: body.mentorShift });
  if (rating) {
    if (body.is_remove) {
      await rating.remove();
      return 'removed';
    } else {
      rating.rating_star = body.rating_star;
      rating.rating_content = body.rating_content;
      await rating.save();
    }
  } else {
    rating = await MentorRating.create({
      user: userId,
      ...body,
    });
  }

  return rating;
}

const createAnswerSheet = async (userId, testId, body) => {
  const test = await Test.findById(testId);
  if (!test) throw new ApiError(httpStatus.FORBIDDEN, "Test not found.");

  const createBody = {
    user: userId,
    testId,
    ...body,
  }

  return AnswerSheet.create(createBody);
}

const getUserAnswerSheet = async (userId, testId) => {
  return AnswerSheet.findOne({ user: userId, testId });
}

// const getResultTableById = async (testId, userId) => {
//   const test = await Test.findById(testId).populate('questions');
//   if (!test) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Test not found');
//   }
//   const key = test.getKey();
//   const sheetFilter = { testId: testId }
//   if (userId) sheetFilter.user = userId;
//   const { results: sheets } = await answerSheetService.queryAnswerSheets(sheetFilter, { populate: "user", limit: 1000 });
//   const results = sheets.map(sheet => {
//     sheet = sheet.toJSON();
//     const result = pick(sheet, ['createdAt', 'updatedAt', 'finishedAt', 'id', 'blurCount']);
//     // result.id = result._id;
//     result.user = pick(sheet.user, ['displayName', 'photoURL', 'email', 'id']);
//     result.trueCount = sheet.choices.filter(c => key.includes(c.choiceId.toString())).length;
//     result.mark = result.trueCount / test.questions.length * 10;
//     return result;
//   })
//   return results;
// }

const updateAnswerSheetById = async (answerSheetId, updateBody) => {
  const answerSheet = await getAnswerSheetById(answerSheetId);
  if (!answerSheet) {
    throw new ApiError(httpStatus.NOT_FOUND, 'AnswerSheet not found');
  }
  Object.assign(answerSheet, updateBody);
  await answerSheet.save();
  return answerSheet;
};

const getAnswerSheetById = async (id, options = null) => {
  let answerSheetPromise = AnswerSheet.findOne({ _id: id });

  if (options?.populate) {
    options.populate.split(',').forEach((populateOption) => {
      answerSheetPromise = answerSheetPromise.populate(
        populateOption
          .split('.')
          .reverse()
          .reduce((a, b) => ({ path: b, populate: a }))
      );
    });
  }

  answerSheetPromise = answerSheetPromise.exec();

  return answerSheetPromise;
};

const submitAnswerSheet = async (userId, roadmapId, courseId, answerSheetId, body) => {
  const userRoadmap = await UserRoadMap.findById(roadmapId);
  if (!userRoadmap) throw new ApiError(httpStatus.FORBIDDEN, "Roadmap not found.");
  if (body.isFinished) body.finishedAt = new Date();
  const answerSheet = await AnswerSheet.findById(answerSheetId);
  if (answerSheet.isFinished)
    throw new ApiError(httpStatus.FORBIDDEN, "This answer was submitted.");

  Object.assign(answerSheet, body);
  await answerSheet.save();

  const courseIndex = userRoadmap.roadmap_milestone.findIndex((milestone) => milestone.course.toString() === courseId.toString());
  if (courseIndex !== -1) {
    if (userRoadmap.roadmap_milestone[courseIndex].done_tests) {
      userRoadmap.roadmap_milestone[courseIndex].done_tests.push(answerSheet.testId);
    } else {
      userRoadmap.roadmap_milestone[courseIndex].done_tests = [answerSheet.testId];
    }
    await userRoadmap.save();
  }

  // check completed course
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(httpStatus.FORBIDDEN, "Course not found.");
	const testAnswerSheets = await AnswerSheet.find({ testId: { $in: course.tests }, user: userId, isFinished: true });
	const existingTestIds = testAnswerSheets.map(sheet => sheet.testId.toString());

  if (course.tests.map((id) => id.toString()).every(testId => existingTestIds.includes(testId))) {
    // update Course finished
    const courseIndex = userRoadmap.roadmap_milestone.findIndex((milestone) => milestone.course.toString() === courseId.toString());
    if (courseIndex !== -1) {
      userRoadmap.roadmap_milestone[courseIndex].is_finished = true;
      userRoadmap.roadmap_milestone[courseIndex].finished_date = Date.now();
      userRoadmap.roadmap_milestone[courseIndex].progress = 100;
			if (!userRoadmap.done_courses) {
				userRoadmap.done_courses = [courseId];
			} else {
				userRoadmap.done_courses.push(courseId);
			}
      await userRoadmap.save();

			// finish mentor shift
			await MentorShift.updateMany(
				{ course: courseId, user: userId, status: 2 },
				{ $set: { status: 3, date_end: Date.now(), is_finished: true } },
			);
    }
  }

  // check completed roadmap
  const allFinished = userRoadmap.roadmap_milestone.every(milestone => milestone.is_finished);
  if (allFinished) {
    userRoadmap.is_finished = true;
    userRoadmap.finished_date = Date.now();
    await userRoadmap.save();
  }

  //return key
  const testKey = await getTestKey(answerSheet.testId);
  answerSheet.mark = answerSheet.choices.filter((c) => testKey.includes(c.choiceId.toString())).length
  await answerSheet.save();
  return {
    answerSheet,
    testKey,
  };
}

const getTestKey = async (testId) => {
  const test = await Test.findById(testId).populate('questions');
  if (!test) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Test not found');
  }
  const key = test.getKey();
  return key;
}

const getUserRoadmapList = async (userId) => {
  const userRoadmaps = await UserRoadMap.find({ user: userId }).populate('jobEducation job').populate('roadmap_milestone.course');

  // Extract modules from the populated data
  const allModules = [];
  userRoadmaps.forEach(roadmap => {
    roadmap.roadmap_milestone.forEach(milestone => {
      if (milestone.course && milestone.course.modules) {
        allModules.push(...milestone.course.modules);
      }
    });
  });
  const moduleProgressLogs = await ModuleProgressLog.find({ user: userId, module: { $in: allModules } }).populate('module', '_id name').populate('course', '_id title');
  const result = userRoadmaps.map((roadmap) => {
    const courseModules = [];
    let progress = 0;
    let max = 0;
    roadmap.roadmap_milestone.forEach(milestone => {
      if (milestone.course && milestone.course.modules) {
        const stringModules = milestone.course.modules.map((item) => item.toString());
        courseModules.push(...stringModules);
      }
      if (milestone.is_finished) {
        progress += (milestone.course?.modules?.length || 0 + milestone.course?.test?.length || 1);
      } else {
        progress += (milestone.done_modules?.length || 0 + milestone.done_tests?.length || 0);
      }
      max += (milestone.course?.modules?.length || 0 + milestone.course?.test?.length || 1);
    });
    const latestModuleLog = moduleProgressLogs.filter((log) => courseModules.includes(log.module.id.toString()))
                                               .reduce((latestLog, currentLog) => {
                                                  return new Date(currentLog.createdAt) > new Date(latestLog.createdAt) ? currentLog : latestLog;
                                                }, {createdAt: "1990-06-15T08:59:05.000Z"});
    return {
      ...roadmap.toObject(),
      currentLearning: (latestModuleLog.module?.id && latestModuleLog.course?.id) ? {
        module: {
          id: latestModuleLog.module?.id,
          name: latestModuleLog.module?.name
        },
        course: {
          id: latestModuleLog.course?.id,
          name: latestModuleLog.course?.title
        },
      } : null,
      overallProgress: Math.round(progress / max * 100),
    }
  })

  return result;
}

const getRoadmapDetail = async (userId, roadmapId) => {
  const userRoadmap = await UserRoadMap.findOne({ user: userId, _id: roadmapId })
  .populate('current_course current_module roadmap_milestone.course')
  .populate({
    path: 'roadmap_milestone.course',
    populate: {
      path: 'modules',
      model: 'Module',
    },
  })
  .populate({
    path: 'roadmap_milestone.course',
    populate: {
      path: 'tests',
      model: 'Test',
    },
  });
  if (!userRoadmap) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Roadmap not found');
  }
  const courseIds = userRoadmap.roadmap_milestone.map((item) => new mongoose.Types.ObjectId(item.course._id));
  const mentorShifts = await MentorShift.aggregate([
    {
      $match: {
        user: userId,
        course: { $in: courseIds }
      }
    },
    {
      $lookup: {
        from: 'mentors', // name of the Mentor collection
        localField: 'mentor',
        foreignField: '_id',
        as: 'mentor'
      }
    },
    {
      $unwind: '$mentor'
    },
    {
      $lookup: {
        from: 'mentorratings', // name of the MentorRating collection
        localField: 'mentor._id',
        foreignField: 'mentor',
        as: 'mentor.ratings'
      }
    }
  ]);
  const job = await Job.findById(userRoadmap.job).select('id title');
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }
  const jobEducation = await JobEducation.findOne({job: job.id});
  if (!jobEducation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job education not found');
  }
  const roadmapProgress = getUserRoadmapProgress(userRoadmap);

  const courses = userRoadmap.roadmap_milestone.map((item) => item.course);
  const testIds = courses.map((item) => item.tests).flat();
  const answersheets = await AnswerSheet.find({ testId: { $in: testIds }, user: userId })

  const roadmapData = userRoadmap.roadmap_milestone.toObject().map((item) => {
    const testResults = [];
    item.course.tests?.forEach((test) => {
      const answerSheet = answersheets.find((sheet) => sheet.testId.toString() === test._id.toString());
      if (answerSheet) {
        testResults.push({
          answerSheet,
          test,
          isFinished: answerSheet.isFinished,
        })
      } else {
        testResults.push({
          test,
          isFinished: false,
        })
      }
    })
    return {
      ...item,
      tests: testResults,
    }
  })

  return {
    userRoadmap: {
      ...userRoadmap.toObject(),
      roadmap_milestone: roadmapData,
    },
    job: job.toObject(),
    jobEducation: jobEducation.toObject(),
    roadmapProgress,
    mentorShifts,
  }
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
  guestJobs,
  suggestJobs,
	getDetailJob,
  applyJob,
  getAppliedJobs,
  startJobEducation,
  getCurrentEducation,
  getUserModule,
  watchedModule,
	unlockRoadmapCourse,
  requestMentor,
  addMentorRating,
  submitAnswerSheet,
  getUserAnswerSheet,
  createAnswerSheet,
  updateAnswerSheetById,
  getAnswerSheetById,
  getTestKey,
  getUserRoadmapList,
  getRoadmapDetail,
  refuseJobEducation,
	checkJobEducationExisted,
};

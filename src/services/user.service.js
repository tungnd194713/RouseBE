const httpStatus = require('http-status');
const { User, UserProfile, Job, JobEducation, CertificateSubjects, CollegeSubjects, JobRequirement, Subject, Certificate, Major, CandidateApply, Course, UserRoadMap, Module, Discussion, Note } = require('../models');
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

const suggestJobs = async (userId) => {
  const userProfile = await UserProfile.findOne({user: userId});
  let userSubjects = userProfile.skills;
  const certificateIds = userProfile.certificates.map((item) => item.certificate);
  const majorIds = userProfile.educations.map((item) => item.major);
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
  let availableJobs = await Job.find({ status: 1 });
  const jobIds = availableJobs.map((item) => item._id);
  const requirements = await JobRequirement.find({ job: { $in: jobIds } }).populate('skills certificates majors colleges');
  const educations = await JobEducation.find({job: { $in: jobIds }});

  availableJobs = availableJobs.map((job) => {
		const education = educations.find(edu => edu.job.toString() == job._id.toString());
    const jobRequirements = requirements.filter((item) => item.job.toString() === job._id.toString());
    const previewSkills = requirements.filter(item => item.type === 'Skill').map(obj => obj.skills).slice(0, 3);

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
  let userSubjects = userProfile.skills;
	const certificateIds = userProfile.certificates.map((item) => item.certificate);
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
  const majorIds = userProfile.educations.map((item) => item.major);
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
	const matchedCourses = await Course.find({
		'skill_tags.skill': { $in: needToLearn.map(item => item.skill) }
	}).populate('modules');
	const needToLearnCourses = [];
	matchedLearning.forEach((item) => {
		const foundCourse = matchedCourses.find((course) => {
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
				...foundCourse.toObject(),
				timeCost,
				tag: item,
			})
		}
	})
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
                  const certificateData = certificatesMap.get(profile.id).toString();
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

	return {
		...job.toObject(),
		date_start: job.date_start ? formatDate(job.date_start) : null,
		date_end: job.date_start ? addMonthsToDate(job.date_start, job.display_month) : null,
		max_education_month: education ? education.max_education_month : null,
		scholarship: education ? education.scholarship : null,
		id: job._id,
		need_to_learn: matchedLearning,
		job_point: suggestResult.jobPoint,
		user_job_point: suggestResult.userJobPoint,
		job_matching_data: jobMatchingDataFinal,
    beginnerSkills,
    intermediateSkills,
    advancedSkills,
    certificates,
    majorColleges,
    previewSkills,
		needToLearnCourses,
    isApplied: isApplied ? true : false,
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
	const jobEducation = JobEducation.findOne({ job: candidateApply.job });
	if (!jobEducation) throw new ApiError(httpStatus.NOT_FOUND, 'Education not found');
	
  const currentCourse = await Course.findById(candidateApply.education_courses[0]);
  const userRoadmap = {
    title: candidateApply.job.title + ' (Lộ trình học)',
    user: userId,
    job: candidateApply.job.id,
    current_course: candidateApply.education_courses[0],
    current_module: currentCourse?.modules[0],
		scholarship: jobEducation.scholarship || 0,
    roadmap_milestone: candidateApply.education_courses.map((item) => {
      return {
        course: item,
        is_skipped: false,
        skippable: true,
        progress: -0,
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
  return 'Education started';
}

const getCurrentEducation = async (userId) => {
  const userRoadmap = await UserRoadMap.findOne({ user: userId, is_finished: false }).populate('current_course current_module roadmap_milestone.course').populate({
    path: 'roadmap_milestone.course',
    populate: {
      path: 'modules',
      model: 'Module',
    },
  });
  if (!userRoadmap) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Roadmap not found');
  }
  const job = await Job.findById(userRoadmap.job).select('id title');
  if (!job) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  }
  const jobEducation = await JobEducation.findOne({job: job.id});
  if (!jobEducation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Job education not found');
  }
  const roadmapProgress = getUserRoadmapProgress(userRoadmap);
  return {
    userRoadmap: userRoadmap.toObject(),
    job: job.toObject(),
    jobEducation: jobEducation.toObject(),
    roadmapProgress,
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
    totalDoneModule += milestone.done_modules.length;
  })

  return totalDoneModule / totalModules * 100;
}

const getUserModule = async (userId, courseId, moduleId) => {
  const userRoadmap = await UserRoadMap.findOne({ user: userId, is_finished: false });

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
  return {
    userRoadmap,
    course,
    moduleData: moduleData.toObject(),
    discussion: discussion,
    noteList: noteList,
  }
}

const watchedModule = async (userId, courseId, moduleId) => {
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');

  if (!course.modules.find((item) => item.toString() === moduleId.toString())) throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');

  const module = await Module.findById(moduleId);
  if (!module) throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');

  const userRoadmap = await UserRoadMap.findOne({ user: userId, is_finished: false });

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

const unlockRoadmapCourse = async (userId, courseId) => {
	const userRoadmap = await UserRoadMap.findOne({ user: userId, is_finished: false });

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
		userRoadmap.roadmap_milestone[milestoneIndex].is_unlocked = true; // Set newValue to your desired boolean value
	} else {
		throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
	}

	await userRoadmap.save();

	const user = await User.findById(userId);
	const point_cost = course.point_cost * ((100 - userRoadmap.scholarship) / 100);
	if (user.point_owned < point_cost) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient point');
	} else {
		user.point_owned = user.point_owned - point_cost;
	}

	await user.save();

	return 'Course unlocked';
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
  applyJob,
  getAppliedJobs,
  startJobEducation,
  getCurrentEducation,
  getUserModule,
  watchedModule,
	unlockRoadmapCourse,
};

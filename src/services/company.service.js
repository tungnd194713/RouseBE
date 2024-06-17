const { Company, Job, CandidateApply, Subject, College, Certificate, Course, Major, CertificateSubjects, CollegeSubjects, JobEducation, UserProfile, User, UserRoadMap, ModuleProgressLog } = require('../models');
const JobRequirement = require('../models/jobRequirement.model');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const mongoose = require('mongoose');

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

const updateCompanyById = async (id, body) => {
  return Company.findByIdAndUpdate(id, body);
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
        number_trainings: data.number_trainings,
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

const updateJobById = async (jobId, body) => {
  const job = await Job.findById(jobId);

  if (!job) throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');
  Object.assign(job, body);
  await job.save();

  let jobEducation = await JobEducation.findOne({ job: jobId });
  if (jobEducation) {
    if (!body.accept_education) {
      await jobEducation.remove();
    } else {
      jobEducation.max_education_month = body.max_education_month;
      // jobEducation.scholarship = body.scholarship (Can not change if paid)
      // jobEducation.number_trainings = body.number_trainings (Can not change if paid)
      await jobEducation.save()
    }
  } else {
    if (body.accept_education && body.accept_education !== 'false') {
      jobEducation = await JobEducation.create({
				company: job.company_id,
				job: job.id,
				max_education_month: body.max_education_month,
				scholarship: body.scholarship,
        number_trainings: body.number_trainings,
			})
    }
  }

  try {
    await JobRequirement.deleteMany({ job: job.id || job._id, company: job.company_id });
    const beginnerSkills = JSON.parse(body.beginnerSkills);
    const intermediateSkills = JSON.parse(body.intermediateSkills);
    const advancedSkills = JSON.parse(body.advancedSkills);
    const certificates = JSON.parse(body.certificates);
    const collegeMajors = JSON.parse(body.collegeMajors);

    const beginnerData = beginnerSkills.map(subArray => {
      const ids = subArray.map(obj => obj.id);
      return {
        job: job.id,
        company: job.company_id,
        skills: ids,
        level: 'Beginner',
        type: 'Skill',
      }
    });
    const intermediateData = intermediateSkills.map(subArray => {
      const ids = subArray.map(obj => obj.id);
      return {
        job: job.id,
        company: job.company_id,
        skills: ids,
        level: 'Intermediate',
        type: 'Skill',
      }
    });
    const advancedData = advancedSkills.map(subArray => {
      const ids = subArray.map(obj => obj.id);
      return {
        job: job.id,
        company: job.company_id,
        skills: ids,
        level: 'Advanced',
        type: 'Skill',
      }
    });
    const certificateData = certificates.map(subArray => {
      const ids = subArray.map(obj => obj.id);
      return {
        job: job.id,
        company: job.company_id,
        certificates: ids,
        type: 'Certificate',
      }
    });
    const collegeMajorData = collegeMajors.map(subArray => {
      const majors = subArray.majors.map(obj => obj.id);
      const colleges = subArray.colleges.map(obj => obj.id);
      return {
        job: job.id,
        company: job.company_id,
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
      jobEducation,
    }
  } catch (e) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something wrong');
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
  const education = await JobEducation.findOne({job: job.id}).populate('courses')
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
  job = {
    ...job.toObject(),
    max_education_month: education ? education.max_education_month : null,
    scholarship: education ? education.scholarship : null,
    id: job._id,
    education: education ? education.toObject() : null,
    education_status: education ? education.status : null,
    date_end: job.date_start ? addMonthsToDate(job.date_start, job.display_month) : null,
    registeredCourses: education && (education.status !== 1) ? education.courses : [],
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

const candidateUpdate = async (candidateApplyId, body) => {
  const candidateApply = await CandidateApply.findById(candidateApplyId).populate('job');
  if (!candidateApply) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CV not found');
  }

  Object.assign(candidateApply, body);
  await candidateApply.save();
  return 'Candidate updated';
}

const acceptEducation = async (candidateApplyId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const candidateApply = await CandidateApply.findById(candidateApplyId).populate('job').session(session);
    if (!candidateApply) {
      throw new ApiError(httpStatus.NOT_FOUND, 'CV not found');
    }

    candidateApply.status = 3;
    await candidateApply.save({ session });

    // Create user roadmap
    const jobEducation = await JobEducation.findOne({ job: candidateApply.job }).session(session);
    await UserRoadMap.create([{
      title: 'Lộ trình học cho vị trí ' + candidateApply.job.title,
      user: candidateApply.user,
      jobEducation: jobEducation.id || jobEducation._id,
      job: candidateApply.job.id || candidateApply.job._id,
      scholarship: jobEducation.scholarship,
      progress: 0,
      applied_date: Date.now(),
      roadmap_milestone: jobEducation.courses.map((course) => ({ course: course.id || course._id })),
    }], { session });

    await session.commitTransaction();
    session.endSession();
    return 'Update success';
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const acceptInterview = async (candidateApplyId) => {
  const candidateApply = await CandidateApply.findById(candidateApplyId);
  if (!candidateApply) {
    throw new ApiError(httpStatus.NOT_FOUND, 'CV not found');
  }
  candidateApply.status = 2
  await candidateApply.save();
  return 'Update success'
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

const getCandidateEducationProgress = async (candidateApplyId, companyId) => {
  const candidateApply = await CandidateApply.findOne({ _id: candidateApplyId, company: companyId });

  if (!candidateApply || !candidateApply.education_applied) throw new ApiError(httpStatus.NOT_FOUND, 'CV not found');

  const user = await User.findById(candidateApply.user);

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, 'User not found');

  const userRoadmap = await UserRoadMap.findOne({ user: candidateApply.user, job: candidateApply.job }).populate('roadmap_milestone.course').populate({
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
    user: user.toObject(),
  }
}

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

const getCVMatchingPoint = async (candidateId, companyId) => {
  const candidateApply = await CandidateApply.findOne({ _id: candidateId, company: companyId });

  if (!candidateApply || !candidateApply.education_applied) throw new ApiError(httpStatus.NOT_FOUND, 'CV not found');

  const userProfile = await UserProfile.findOne({user: candidateApply.user});
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
	const job = await Job.findById(candidateApply.job);
	const jobRequirements = await JobRequirement.find({ job: candidateApply.job }).populate('skills certificates majors colleges');

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

	return {
		...job.toObject(),
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
	}
}

const openJobEducation = async (jobId, companyId) => {
	const job = await Job.findOne({ _id: jobId, company_id: companyId });

  if (!job) throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');

  const jobEducation = await JobEducation.findOne({ job: jobId }).populate('courses');
  if (!jobEducation) throw new ApiError(httpStatus.NOT_FOUND, 'Education not found');

  if (!jobEducation.scholarship_paid) {
		jobEducation.status = 3;
		await jobEducation.save();
		const totalPointCost = coursesArray.reduce((total, course) => {
			return total + course.point_cost;
		}, 0);

		const scholarship = totalPointCost * (jobEducation.scholarship / 100) * jobEducation.number_trainings;
		const company = await Company.findById(companyId);
		if (company.point_owned < scholarship) {
			throw new ApiError(httpStatus.BAD_REQUEST, 'Insufficient point');
		} else {
			company.point_owned -= scholarship;
		}
		await company.save();
	}

  return 'Education updated';
}

const toggleJobEducation = async (jobId, companyId) => {
  const job = await Job.findOne({ _id: jobId, company_id: companyId });

  if (!job) throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');

  const jobEducation = await JobEducation.findOne({ job: jobId });
  if (!jobEducation) throw new ApiError(httpStatus.NOT_FOUND, 'Education not found');
  if (jobEducation.status === 2) {
    jobEducation.status = 3;
  } else {
    jobEducation.status = 2;
  }
  await jobEducation.save();

  return 'Education updated';
}

const sendChangeRequest = async (jobId, companyId, body) => {
  console.log(jobId, companyId)
  const job = await Job.findOne({ _id: jobId, company_id: companyId });

  if (!job) throw new ApiError(httpStatus.NOT_FOUND, 'Job not found');

  const jobEducation = await JobEducation.findOne({ job: jobId });
  if (!jobEducation) throw new ApiError(httpStatus.NOT_FOUND, 'Education not found');

  await JobEducation.updateOne(
    { _id: jobEducation.id || jobEducation._id },
    {
      $push: { change_requests: body.change_request },
      $set: { status: 4 }
    }
  );

  return 'Education updated';
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

const getEducationList = async (companyId, filter, options) => {
	const queryOption = {
		...options,
		populate: 'job,userRoadmaps',
	}
  const filterOption = {
    ...filter,
    company: companyId,
  }
	const educations = await JobEducation.paginate(filterOption, queryOption);

  const jobIds = educations.results.map((item) => item.job.id);
  const requirements = await JobRequirement.find({ job: { $in: jobIds } }).populate('skills certificates majors colleges');
  const returnedEducations = educations.results.map((education) => {
    const requirement = requirements.filter((item) => item.job.toString() === education.job.id.toString());
    const convertedRequirements = {};
    convertedRequirements.majorColleges = requirement.filter((item) => item.type === 'Major');
    convertedRequirements.certificates = requirement.filter((item) => item.type === 'Certificate');
    convertedRequirements.beginnerSkills = requirement.filter((item) => item.type === 'Skill' && item.level === 'Beginner').map(obj => obj.skills)
    convertedRequirements.intermediateSkills = requirement.filter((item) => item.type === 'Skill' && item.level === 'Intermediate').map(obj => obj.skills);
    convertedRequirements.advancedSkills = requirement.filter((item) => item.type === 'Skill' && item.level === 'Advanced').map(obj => obj.skills);
    return {
      ...education.toObject(),
      requirements: convertedRequirements,
      userRoadmaps: education.userRoadmaps,
    }
  })
	return {
    ...educations,
    results: returnedEducations,
  };
}

const getEducationDetail = async (userId, educationId) => {
  const education = await JobEducation.findOne({company: userId, _id: educationId}).populate('courses')
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
  })
  .populate('userRoadmaps');
  if (!education) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something wrong');
  let job = await Job.findById(education.job);
  job = {
    ...job.toObject(),
    max_education_month: education ? education.max_education_month : null,
    scholarship: education ? education.scholarship : null,
    id: job._id,
    education: education ? education.toObject() : null,
    education_status: education ? education.status : null,
    date_end: job.date_start ? addMonthsToDate(job.date_start, job.display_month) : null,
    registeredCourses: education && (education.status !== 1) ? education.courses : [],
    userRoadmaps: education ? education.userRoadmaps : [],
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

const getEducationParticipant = async (companyId, educationId) => {
  const education = await JobEducation.findOne({ company: companyId, _id: educationId });
  if (!education) throw new ApiError(httpStatus.NOT_FOUND, 'Education not found');

  const userRoadmaps = await UserRoadMap.find({ job: education.job }).populate('roadmap_milestone.course user');

  const allUsers = userRoadmaps.map((item) => item.user.id || item.user._id);

  const candidateApplies = await CandidateApply.find({ job: education.job, user: { $in: allUsers } });

  // Extract modules from the populated data
  const allModules = [];
  userRoadmaps.forEach(roadmap => {
    roadmap.roadmap_milestone.forEach(milestone => {
      if (milestone.course && milestone.course.modules) {
        allModules.push(...milestone.course.modules);
      }
    });
  });
  const moduleProgressLogs = await ModuleProgressLog.find({ user: { $in: allUsers }, module: { $in: allModules } });
  const userRoadmapData = userRoadmaps.map((roadmap) => {
    const candidateApply = candidateApplies.find((item) => item.user.toString() === roadmap.user._id.toString() || item.user.toString() === roadmap.user.id.toString());
    const courseModules = [];
    const watchedModules = [];
    const doneCourses = roadmap.roadmap_milestone.filter((item) => item.is_finished);
    roadmap.roadmap_milestone.forEach(milestone => {
      if (milestone.course && milestone.course.modules) {
        const stringModules = milestone.course.modules.map((item) => item.toString());
        const stringDoneModules = milestone.done_modules.map((item) => item.toString());
        courseModules.push(...stringModules);
        watchedModules.push(...stringDoneModules);
      }
    });
    const watchedTime = moduleProgressLogs.filter((item) => courseModules.includes(item.module.toString()))
                                                     .reduce((total, log) => total + log.video_update_time - log.video_start_time, 0);
    return {
      watchedTime: Math.round(watchedTime),
      watchedModules: `${watchedModules.length}/${courseModules.length} module`,
      doneCourses: `${doneCourses.length}/${roadmap.roadmap_milestone.length} khóa`,
      userName: roadmap.user.name,
      isFinished: roadmap.is_finished,
      startDate: roadmap.applied_date,
      finishedDate: roadmap.is_finished ? roadmap.finished_date : null,
      userId: roadmap.user.id || roadmap.user._id,
      id: roadmap.id || roadmap._id,
      candidateApplyId: candidateApply.id || candidateApply._id,
    }
  })

  return userRoadmapData;
}

const createNewEducationRequest = async (companyId, body) => {
  const data = {
    ...body,
    company: companyId,
  }

  return JobEducation.create(body);
}

module.exports = {
	getCompanyByEmail,
	getCompanyJobs,
	getCompanyById,
  updateCompanyById,
	createJob,
  updateJobById,
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
  getCandidateEducationProgress,
  getCVMatchingPoint,
  toggleJobEducation,
	openJobEducation,
  sendChangeRequest,
  candidateUpdate,
  getEducationList,
  createNewEducationRequest,
  getEducationDetail,
  getEducationParticipant,
}

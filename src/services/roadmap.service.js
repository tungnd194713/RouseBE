/* eslint-disable camelcase */
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const { RoadMap, Milestone, Category, SpecCategory, RoadmapTemplate, UserRoadMap, ModuleProgress, JobEducation, Course, JobRequirement, CertificateSubjects, CollegeSubjects, Module, InstructorCourse, Instructor, Test, Question, AnswerSheet, Company, Job } = require('../models');
const { convertRequirements, skillLevelCompare } = require('../helpers/roadmap.helper');

async function findRoadmap(categoryId, subCategoryId, mastery) {
  const query = {};
  if (categoryId != null) query.categoryId = categoryId;
  if (subCategoryId != null) query.subCategoryId = subCategoryId;
  if (mastery != null) query.mastery = mastery;

  const roadmap = await RoadMap.findOne({ name: /.*full.*/i }).populate({
    path: 'milestones.modules',
    model: 'Module', // Replace 'Module' with the actual name of your Module model
  });

  if (!roadmap) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Roadmap not found');
  }

  return roadmap;
}

const createMilestone = async (params) => {
  return Milestone.create({ ...params });
};

const fetchCategories = async () => {
  return Category.find({});
};

const fetchSpecCategories = async (categoryId) => {
  return SpecCategory.find({ category_id: categoryId });
};

const buildRoadmap = async (params) => {
  // params = {
  //   main_goal: ObjectId,
  //   specific_goal: ObjectId,
  //   experience_level: String,
  //   skill_set: array,
  // }
  const baseQuery = {
    main_goal: { $eq: [params.main_goal] },
    specific_goal: { $eq: [params.specific_goal] },
    experience_level: { $in: [params.experience_level] },
  };
  // Conditionally add the 'skill_set' property to the query
  if (params.skill_set && params.skill_set.length > 0) {
    baseQuery.skill_set = { $in: [params.skill_set] };
  }
  // Execute the query
  const matchedMilestones = await Milestone.find(baseQuery).populate('skill_set').populate({ path: 'modules' });

  const matchedRoadmap = await RoadmapTemplate.findOne({
    categoryId: { $eq: [params.main_goal] },
    subCategoryId: { $eq: [params.specific_goal] },
  });

  const roadmapMilestone = [];
  const skillSet = [];
  const baseRoad = matchedRoadmap.base_milestone;
  baseRoad.forEach((item) => {
    const idMatchedMilestones = matchedMilestones.filter(
      (element) => element.base_milestone_id.toString() === item._id.toString()
    );
    if (idMatchedMilestones && idMatchedMilestones.length) {
      const milestone = idMatchedMilestones[Math.floor(Math.random() * idMatchedMilestones.length)];
      const stoneObject = milestone.toObject();
      delete stoneObject.base_milestone_id;
      roadmapMilestone.push(stoneObject);
      const skill_tags = stoneObject.skill_set.map((skill) => skill.name);
      skillSet.push([...skill_tags]);
    }
  });

  const returnedRoadmap = {
    title: matchedRoadmap.title,
    description: matchedRoadmap.description,
    milestone: roadmapMilestone,
    skillTags: skillSet,
  };

  delete returnedRoadmap.base_milestone;

  return returnedRoadmap;
};

const applyRoadmap = async (params) => {
  const appliedMilestones = [];
  Array.from(params.milestone).forEach((milestone) => {
    appliedMilestones.push({
      milestone: milestone._id,
      modules: Array.from(milestone.modules).map((item) => item._id),
    });
  });
  const roadmapInfo = {
    estimated_time: params.milestone.reduce((time, item) => time + item.estimated_time.value, 0),
    experience_level: params.experience_level,
    skill_set: params.skill_set,
  };
  UserRoadMap.create({
    title: params.title,
    user_id: params.user_id,
    description: params.description,
    categoryId: params.category_id,
    subCategoryId: params.sub_category_id,
    roadmap_milestone: appliedMilestones,
    roadmap_info: roadmapInfo,
    current_milestone: appliedMilestones[0].milestone,
    current_module: appliedMilestones[0].modules[0],
    applied_date: Date.now(),
  });
};

const getUserRoadmap = async (user_id) => {
  return UserRoadMap.findOne({ user_id })
    .populate('current_module current_milestone')
    .populate({ path: 'roadmap_milestone', populate: { path: 'milestone' } });
};

const getMilestoneModuleProgress = async (milestone_id) => {
  const milestone = await Milestone.findOne({ _id: milestone_id }).populate('modules');
  const moduleProgress = await ModuleProgress.find({ module_id: { $in: [...milestone.modules] } });
  let milestoneModules = [...milestone.modules];
  milestoneModules = milestoneModules.map((item) => {
    // eslint-disable-next-line eqeqeq
    const progress = moduleProgress.find((element) => element.module_id == item.id);
    if (progress) {
      return {
        ...progress.toObject(),
        ...item.toObject(),
      };
    }
    return {
      ...item.toObject(),
      module_id: item._id,
    };
  });
  return milestoneModules;
};

const completeMilestone = async (milestone_id, user_id) => {
  const userRoadmap = await UserRoadMap.findOne({ user_id, is_finished: false });
  // eslint-disable-next-line eqeqeq
  const milestoneIndex = userRoadmap.roadmap_milestone.findIndex((item) => item.milestone == milestone_id);
  if (milestoneIndex !== -1) {
    userRoadmap.roadmap_milestone[milestoneIndex].is_finished = true;
    userRoadmap.roadmap_milestone[milestoneIndex].progress = 100;
    userRoadmap.roadmap_milestone[milestoneIndex].finished_date = Date.now();
    userRoadmap.progress = ((milestoneIndex + 1) / userRoadmap.roadmap_milestone.length) * 100;
    if (milestoneIndex !== userRoadmap.roadmap_milestone.length - 1) {
      const newMilestone = await Milestone.findOne({
        _id: userRoadmap.roadmap_milestone[milestoneIndex + 1].milestone,
      }).populate('modules');
      userRoadmap.current_milestone = newMilestone._id;
      if (newMilestone.modules.length !== 0) {
        userRoadmap.current_module = newMilestone.modules[0]._id;
      }
    }
    await userRoadmap.save();
  }
};

const getPublishedEducations = async (options, params) => {
	const filter = {
		status: 3,
	}
  const queryOptions = {
		...options,
    populate: 'job,company,course,userRoadmaps'
	}
  const result = await JobEducation.paginate(filter, queryOptions);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Education not found');
  }

	const jobEducations = result.results.map((item) => {
		const totalPoint = item.courses.reduce((acc, course) => acc + course.point_cost, 0);
		return {
			id: item.id || item._id,
			job_title: item.job.title,
			company_name: item.company.company_name,
			max_education_month: item.max_education_month,
			course_count: item.courses.length,
			user_count: item.userRoadmaps.length,
			point_cost: totalPoint,
			published_at: item.published_at,
		}
	});

	return {
		...result,
		results: jobEducations,
	}
}

const getEducationRequests = async (options, params) => {
  const certificateObjects = await CertificateSubjects.find({}).populate('subject_objects.subject');
  const majorObjects = await CollegeSubjects.find({}).populate('subject_objects.subject');
  const filter = {}
  const queryOptions = {
		...options,
    populate: 'job,company'
	}
  if (params.status) {
    filter.status = params.status;
  }
  if (params.companyName) {
    const companies = await Company.find({company_name: { "$regex": params.companyName, "$options": "i" }})
    const companyIds = companies.map((item) => item.id || item._id);
    filter.company = { $in: companyIds }
  }
  if (params.jobName) {
    const jobs = await Job.find({title: { "$regex": params.jobName, "$options": "i" }})
    const jobIds = jobs.map((item) => item.id || item._id);
    filter.job = { $in: jobIds }
  }
  const result = await JobEducation.paginate(filter, queryOptions);
  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const jobEducations = result.results;
  const jobIds = jobEducations.map((item) => item.job.id);
  const jobRequirements = await JobRequirement.find({job: { $in: jobIds }}).populate('skills majors certificates colleges');
  const newResults = jobEducations.map((item) => {
    const requirements = [];
    jobRequirements.forEach((req) => {
      if (req.job.toString() === item.job.id.toString()) {
        requirements.push(req);
      }
    })
    const convertedRequirements = convertRequirements(requirements, certificateObjects, majorObjects);
    return {
      ...item.toObject(),
      requirements,
      convertedRequirements
    }
  })

  result.results = newResults;
  return result;
}

const getEducationCourses = async (jobEducationId) => {
  const certificateObjects = await CertificateSubjects.find({}).populate('subject_objects.subject');
  const majorObjects = await CollegeSubjects.find({}).populate('subject_objects.subject');
  const jobEducation = await JobEducation.findById(jobEducationId).populate('job company');
  if (!jobEducation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const courseIds = jobEducation.courses.map((item) => item._id || item.id);
  const instructorCourses = await InstructorCourse.find({ jobEducation: jobEducationId });
  const iCourseIds = instructorCourses.map((item) => item.course);
  const courses = await Course.find({ _id: { $in: [...courseIds, ...iCourseIds] } }).populate('skill_tags.skill').populate({ path: 'instructorCourse', populate: { path: 'instructor' } });
  const jobRequirement = await JobRequirement.find({ job: jobEducation.job }).populate('skills majors certificates colleges');
  const convertedRequirements = convertRequirements(jobRequirement, certificateObjects, majorObjects);

  return {
    ...jobEducation.toObject(),
    allCourses: courses,
		requirements: jobRequirement,
    convertedRequirements,
  };
}

const checkEducationRoadmap = async (jobEducationId) => {
  const certificateObjects = await CertificateSubjects.find({}).populate('subject_objects.subject');
  const majorObjects = await CollegeSubjects.find({}).populate('subject_objects.subject');
  const jobEducation = await JobEducation.findById(jobEducationId).populate('job company courses').populate({ path: 'courses', populate: { path: 'skill_tags.skill' } });
  if (!jobEducation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const jobRequirement = await JobRequirement.find({ job: jobEducation.job }).populate('skills majors certificates colleges');
  const convertedRequirements = convertRequirements(jobRequirement, certificateObjects, majorObjects);
  const courseTags = jobEducation.courses.map((item) => item.skill_tags).flat().map((item) => {
    return {
      _id: item.skill._id || item.skill.id,
      level: item.level,
      skill: item.skill.name,
    }
  })

  let matchedPoint = 0;
  convertedRequirements.forEach((requirement) => {
    if (courseTags.find((item) => item._id.toString() === requirement._id.toString() && skillLevelCompare(requirement.level, item.level))) {
      matchedPoint += 1;
    }
  })

  if (matchedPoint === convertedRequirements.length) {
    return true
  }
  return false;
}

const sendEducationRoadmap = async (jobEducationId) => {
  const jobEducation = await JobEducation.findById(jobEducationId);
  if (!jobEducation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }

  if (jobEducation.status === 1) {
    jobEducation.status = 2;
  } else if (jobEducation.status === 2) {
    jobEducation.status = 1;
  } else if (jobEducation.status === 4) {
    jobEducation.status = 2;
	}
  await jobEducation.save();
  return "Request sent";
}

const createEducationCourse = async (jobEducationId, body) => {
  const jobEducation = await JobEducation.findById(jobEducationId);
  if (!jobEducation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const course = await Course.create({
		...body,
		skill_tags: JSON.parse(body.tags),
	});
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }
	if (!course.tests || !course.tests.length) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Khóa học này chưa được tạo test!');
	}
  await JobEducation.updateOne(
    { _id: jobEducationId },
    { $push: { courses: course.id || course._id } },
  );
  return course;
}

const addExistingEducationCourse = async (jobEducationId, courseId) => {
  const jobEducation = await JobEducation.findById(jobEducationId);
  if (!jobEducation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }
	if (!course.tests || !course.tests.length) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Khóa học này chưa được tạo test!');
	}
  const isAdded = jobEducation.courses.find((item) => item.toString() === courseId.toString());
  if (isAdded) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Course already added');
  }
  await JobEducation.updateOne(
    { _id: jobEducationId },
    { $push: { courses: courseId } },
  );
  return courseId;
}

const removeCourseFromRoadmap = async (jobEducationId, courseId) => {
  const jobEducation = await JobEducation.findById(jobEducationId);
  if (!jobEducation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }
  const existing = jobEducation.courses.find((item) => item.toString() === courseId.toString());
  if (!existing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');
  }
  await JobEducation.updateOne(
    { _id: jobEducationId },
    { $pull: { courses: courseId } },
  );
  return courseId;
}

const getCourseDetail = async (jobEducationId, courseId) => {
  const jobEducation = await JobEducation.findById(jobEducationId).populate('job company');

  if (!jobEducation) throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');

  const course = await Course.findById(courseId).populate('modules skill_tags.skill tests');
  return {
		...jobEducation.toObject(),
		...course.toObject(),
	};
}

const createEducationModule = async (courseId, body) => {
  const course = await Course.findById(courseId);

	if (!course) throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');

	const createdModule = await Module.create(body);
	if (!createdModule) throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Create failed');

	await Course.updateOne(
    { _id: courseId },
    { $push: { modules: createdModule.id || createdModule._id } },
  );

	return createdModule;
}

const removeEducationModuleFromCourse = async (jobEducationId, courseId, moduleId) => {
	const jobEducation = await JobEducation.findById(jobEducationId);

  if (!jobEducation) throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');

  const course = await Course.findById(courseId);

	if (!course) throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');

	const module = await Module.findById(moduleId);
	if (!module) throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');

	await Course.updateOne(
    { _id: courseId },
    { $pull: { modules: module.id || module._id } },
  );

	await module.remove();

	return moduleId;
}

const getEducationModule = async (jobEducationId, courseId, moduleId) => {
	const jobEducation = await JobEducation.findById(jobEducationId).populate('job company');

  if (!jobEducation) throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');

  const course = await Course.findById(courseId);

	if (!course) throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');

	const createdModule = await Module.findById(moduleId);
	if (!createdModule) throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');

	return {
    ...jobEducation.toObject(),
    course: course.toObject(),
    module: createdModule.toObject(),
  };
}

const updateEducationModule = async (jobEducationId, courseId, moduleId, body) => {
  const jobEducation = await JobEducation.findById(jobEducationId).populate('job company');

  if (!jobEducation) throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');

  const course = await Course.findById(courseId);

	if (!course) throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');

	const module = await Module.findById(moduleId);
	if (!module) throw new ApiError(httpStatus.NOT_FOUND, 'Module not found');

  module.name = body.name;
  module.description = body.description;
  module.video = body.video;
  module.video_duration = body.video_duration;
  module.check_point_quizzes = body.check_point_quizzes;
  await module.save();

  return 'Save success';
}

const getListInstructor = async (params, options) => {
  // params = {
  //   tag: subjectId,
  // }
  const filter = {}
	if (params.tag) {
		filter.specialized_fields = {
      $elemMatch: {
        subject: params.tag, // Filter by subject within specialized_fields array
      }
    };
	}
  const queryOptions = {
    ...options,
		populate: 'user specialized_fields.subject'
  }
  return Instructor.paginate(filter, queryOptions)
}

const createInstructorCourse = async (jobEducationId, body) => {
  const jobEducation = await JobEducation.findById(jobEducationId)

  if (!jobEducation) throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');

  // body = {
  //   title,
  //   description,
  //   point_cost
  //   estimated_time,
  //   skill_tags,
  //   instructor,
  //   deadline,
  //   requirement,
  // }

  const courseParams = {
    title: body.title,
    description: body.description,
    point_cost: body.point_cost,
    estimated_time: body.estimated_time,
    skill_tags: JSON.parse(body.tags),
  }

  const createdCourse = await Course.create(courseParams);

  if (!createdCourse)  throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Something wrong');
	let instructorCourseParams = {}
	if (body.isInstructor === "true") {
		instructorCourseParams = {
			jobEducation: jobEducationId,
			course: createdCourse.id || createdCourse._id,
			instructor: body.instructor,
			requirement: body.requirement,
			deadline: body.deadline,
		}
	} else {
		instructorCourseParams = {
			jobEducation: jobEducationId,
			course: createdCourse.id || createdCourse._id,
			isAdmin: true,
		}
	}
	return InstructorCourse.create(instructorCourseParams);

}

const getListInstructorCourse = async (params, options) => {
  const filter = {}
	if (params.jobEducation) {
		filter.jobEducation = params.jobEducation
	}
  if (params.instructor) {
		filter.instructor = params.instructor
  }
  if (params.status) {
		filter.status = params.status
  }
  if (params.is_read !== null && params.is_read !== undefined) {
		filter.is_read = params.is_read
  }
  if (params.is_done !== null && params.is_done !== undefined) {
		filter.is_done = params.is_done
  }
  const queryOptions = {
    ...options,
		populate: 'course,course.skill_tags.skill,jobEducation,instructor'
  }
  return InstructorCourse.paginate(filter, queryOptions)
}

const getInstructorCourseById = async (userId, instructorCourseId) => {
  const instructor = await Instructor.findOne({ user: userId });

  if (!instructor) throw new ApiError(httpStatus.NOT_FOUND, 'Instructor not found');

  const instructorCourse = await InstructorCourse.findOne({ _id: instructorCourseId, instructor: instructor.id || instructor._id })
                                                 .populate('course jobEducation instructor')
                                                 .populate({ path: 'course', populate: { path: 'skill_tags.skill', model: 'Subject' } })
                                                 .populate({ path: 'course', populate: { path: 'modules', model: 'Module' } })
                                                 .populate({ path: 'course', populate: { path: 'tests', model: 'Test' } });

  if (!instructorCourse.is_read) {
    instructorCourse.is_read = true;
    await instructorCourse.save();
  }

  return instructorCourse;
}

const signAsComplete = async (userId, instructorCourseId) => {
  const instructor = await Instructor.findOne({ user: userId });

  if (!instructor) throw new ApiError(httpStatus.NOT_FOUND, 'Instructor not found');

  const instructorCourse = await InstructorCourse.findOne({ _id: instructorCourseId, instructor: instructor.id || instructor._id })

  instructorCourse.is_done = true;
  instructorCourse.status = 1;
  await instructorCourse.save();

  return instructorCourse;
}

const goToFix = async (userId, instructorCourseId) => {
  const instructor = await Instructor.findOne({ user: userId });

  if (!instructor) throw new ApiError(httpStatus.NOT_FOUND, 'Instructor not found');

  const instructorCourse = await InstructorCourse.findOne({ _id: instructorCourseId, instructor: instructor.id || instructor._id })

  instructorCourse.is_done = false;
  instructorCourse.status = 0;
  await instructorCourse.save();

  return instructorCourse;
}

const addReviewToInstructorCourse = async (userId, instructorCourseId, body) => {
  const instructorCourse = await InstructorCourse.findById(instructorCourseId)

  if (!instructorCourse) throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');

  const reviewParams = {
    content: body.content,
    created_by: userId,
  }

  PersonModel.update(
    { _id: instructorCourseId },
    { $push: { reviews: reviewParams } },
  );

  return 'Review added'
}

const updateReviewOfInstructorCourse = async (userId, instructorCourseId, reviewId, body) => {
  const instructorCourse = await InstructorCourse.findById(instructorCourseId)

  if (!instructorCourse) throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');

  const review = instructorCourse.reviews.id(reviewId);
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Review not found');
  }

  if (body.content) {
    review.content = body.content;
  }
  if (body.is_resolved) {
    review.is_resolved = body.is_resolved;
  }

  await instructorCourse.save();

  return 'Review updated'
}

const updateInstructorCourseStatus = async (instructorCourseId, body) => {
  const instructorCourse = await InstructorCourse.findById(instructorCourseId)

  if (!instructorCourse) throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');

  instructorCourse.status = body.status;

  await instructorCourse.save()

  return 'Status updated!';
}

const createNewTestToCourse = async (courseId, body) => {
  const course = await Course.findById(courseId);

  if (!course) throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');

  const newTest = await Test.create(body);

  course.tests.push(newTest._id || newTest.id);

  await course.save();

  return newTest._id || newTest.id;
}

const createNewQuestionToTest = async (testId, body) => {
  const test = await Test.findById(testId);

  if (!test) throw new ApiError(httpStatus.NOT_FOUND, 'Test not found');

  const newQuestion = await Question.create(body);

  test.questions.push(newQuestion._id || newQuestion.id);

  await test.save();

  return newQuestion;
}

const getTestById = async (testId) => {
  // const test = await Test.findById(testId).populate({ path: 'questions', populate: { path: 'choices', model: 'Choice' } })
  const test = await Test.findById(testId).populate({ path: 'questions', model: 'Question' })
  if (!test) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Test not found');
  }
  return test;
};


const updateTestById = async (testId, updateBody) => {
  const test = await Test.findById(testId);
  if (!test) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Test not found');
  }
  Object.assign(test, updateBody);
  await test.save();
  return test;
};

/**
 * Delete test by id
 * @param {ObjectId} testId
 * @returns {Promise<Test>}
 */
const deleteTestById = async (testId) => {
  const test = await Test.findById(testId);
  if (!test) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Test not found');
  }
  await AnswerSheet.deleteMany({ testId });
  await test.remove();
  return test;
};

const updateQuestionById = async (questionId, updateBody) => {
  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(httpStatus.NOT_FOUND, "Question not found");
  }
  //   if (updateBody.email && (await Question.isEmailTaken(updateBody.email, questionId))) {
  //     throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  //   }
  Object.assign(question, updateBody);
  await question.save();
  return question;
};

/**
 * Delete question by id
 * @param {ObjectId} questionId
 * @returns {Promise<Question>}
 */
const deleteQuestionById = async (questionId) => {
  const question = await Question.findById(questionId);
  if (!question) {
    throw new ApiError(httpStatus.NOT_FOUND, "Question not found");
  }
  await question.remove();
  return question;
};

const getRoadmapById = async (roadmapId) => {
	const roadmap = await UserRoadMap.findById(roadmapId);
  if (!roadmap) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Test not found');
  }
  return roadmap;
}


module.exports = {
  findRoadmap,
  buildRoadmap,
  createMilestone,
  fetchCategories,
  fetchSpecCategories,
  getUserRoadmap,
  getMilestoneModuleProgress,
  completeMilestone,
  applyRoadmap,
	getPublishedEducations,
  getEducationRequests,
  getEducationCourses,
  getCourseDetail,
  addExistingEducationCourse,
  removeCourseFromRoadmap,
	createEducationModule,
	removeEducationModuleFromCourse,
	createEducationCourse,
  getEducationModule,
  updateEducationModule,
  checkEducationRoadmap,
  sendEducationRoadmap,
  getListInstructor,
  createInstructorCourse,
  getListInstructorCourse,
  addReviewToInstructorCourse,
  updateReviewOfInstructorCourse,
  updateInstructorCourseStatus,
  createNewTestToCourse,
  createNewQuestionToTest,
  getTestById,
  updateTestById,
  deleteTestById,
  updateQuestionById,
  deleteQuestionById,
  getInstructorCourseById,
  signAsComplete,
  goToFix,
	getRoadmapById,
};

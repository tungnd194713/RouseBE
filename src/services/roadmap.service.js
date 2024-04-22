/* eslint-disable camelcase */
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const { RoadMap, Milestone, Category, SpecCategory, RoadmapTemplate, UserRoadMap, ModuleProgress, JobEducation, Course, JobRequirement, CertificateSubjects, CollegeSubjects } = require('../models');
const { convertRequirements } = require('../helpers/roadmap.helper');

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

const getEducationRequests = async (options, params) => {
  const certificateObjects = await CertificateSubjects.find({}).populate('subject_objects.subject');
  const majorObjects = await CollegeSubjects.find({}).populate('subject_objects.subject');
  const filter = {}
  const queryOptions = {
		...options,
    populate: 'job,company'
	}
  if (params && params.status) {
    filter.status = params.status;
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
  const jobEducation = await JobEducation.findById(jobEducationId).populate('job company courses').populate({ path: 'courses', populate: { path: 'skill_tags.skill' } });
  if (!jobEducation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Request not found');
  }
  const jobRequirement = await JobRequirement.find({ job: jobEducation.job }).populate('skills majors certificates colleges');
  const convertedRequirements = convertRequirements(jobRequirement, certificateObjects, majorObjects);

  return {
    ...jobEducation.toObject(),
    convertedRequirements,
  };
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
  const isAdded = jobEducation.courses.find((item) => item.toString() === courseId.toString());
  if (isAdded) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Course already added');
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

  const hasCourse = jobEducation.courses.find((item) => item.toString() === courseId.toString());
  if (!hasCourse) throw new ApiError(httpStatus.NOT_FOUND, 'Course not found');

  const course = await Course.findById(courseId).populate('modules skill_tags.skill');
  return course;
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
  getEducationRequests,
  getEducationCourses,
  getCourseDetail,
  addExistingEducationCourse,
  removeCourseFromRoadmap,
};

/* eslint-disable camelcase */
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const { RoadMap, Milestone, Category, SpecCategory, RoadmapTemplate, UserRoadMap, ModuleProgress } = require('../models');

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

const seedCategory = async () => {
  const categoryData = [
    {
      title: 'Software Development',
      subcategories: [
        { title: 'Frontend Development' },
        { title: 'Backend Development' },
        { title: 'Mobile App Development' },
      ],
    },
    {
      title: 'Data Science',
      subcategories: [{ title: 'Machine Learning' }, { title: 'Data Analytics' }, { title: 'Big Data' }],
    },
    {
      title: 'Digital Marketing',
      subcategories: [{ title: 'Social Media Marketing' }, { title: 'SEO' }, { title: 'Content Marketing' }],
    },
    {
      title: 'Graphic Design',
      subcategories: [{ title: 'Web Design' }, { title: 'UI/UX Design' }, { title: 'Print Design' }],
    },
    // Add more categories and their corresponding subcategories as needed
  ];

  // Clear existing data
  await Category.deleteMany({});
  await SpecCategory.deleteMany({});

  // Create an array to hold all category and subcategory documents
  const creatingCategories = [];
  const creatingSubCategories = [];

  // Seed new data for categories and subcategories
  // eslint-disable-next-line no-restricted-syntax
  for (const category of categoryData) {
    const createdCategory = { title: category.title };
    creatingCategories.push(createdCategory);
  }

  await Category.insertMany(creatingCategories);

  const createdCategories = await Category.find({});

  // eslint-disable-next-line no-restricted-syntax
  for (const seedingCategory of categoryData) {
    const index = categoryData.findIndex((x) => x.title === seedingCategory.title);
    // eslint-disable-next-line no-restricted-syntax
    for (const seedingSubCategory of seedingCategory.subcategories) {
      const subCate = { title: seedingSubCategory.title, category_id: createdCategories[index]._id };
      creatingSubCategories.push(subCate);
    }
  }
  await SpecCategory.insertMany(creatingSubCategories);
};

const seedMilestones = async () => {
  // const softwareDevelopmentMainGoal = new mongoose.Types.ObjectId('659ec171bf031a2f14db42a2');
  // const frontendDevelopmentSpecificGoal = new mongoose.Types.ObjectId('659ec171bf031a2f14db42a8');
  // const frontendEngineerRoadmapMilestones = [
  //   {
  //     title: 'Learn HTML and CSS',
  //     description: 'Understand the basics of HTML and CSS for web development.',
  //     estimated_time: { name: '2 weeks', value: 336 },
  //     experience_level: ['Beginner'],
  //     main_goal: [softwareDevelopmentMainGoal],
  //     specific_goal: [frontendDevelopmentSpecificGoal],
  //     base_milestone_id: new mongoose.Types.ObjectId('659ec80ee3638572709ba46d'),
  //   },
  //   {
  //     title: 'Master JavaScript',
  //     description: 'Deepen your knowledge of JavaScript, including ES6+ features.',
  //     estimated_time: { name: '4 weeks', value: 672 },
  //     experience_level: ['Beginner'],
  //     main_goal: [softwareDevelopmentMainGoal],
  //     specific_goal: [frontendDevelopmentSpecificGoal],
  //     base_milestone_id: new mongoose.Types.ObjectId('659ec80ee3638572709ba46e'),
  //   },
  //   {
  //     title: 'Build React Applications',
  //     description: 'Learn and apply React for building modern user interfaces.',
  //     estimated_time: { name: '6 weeks', value: 1008 },
  //     experience_level: ['Beginner'],
  //     main_goal: [softwareDevelopmentMainGoal],
  //     specific_goal: [frontendDevelopmentSpecificGoal],
  //     base_milestone_id: new mongoose.Types.ObjectId('659ec80ee3638572709ba46f'),
  //   },
  //   {
  //     title: 'Use Build Tools',
  //     description: 'Explore and use build tools like Webpack for optimizing your code.',
  //     estimated_time: { name: '2 weeks', value: 336 },
  //     experience_level: ['Beginner', 'Intermediate'],
  //     main_goal: [softwareDevelopmentMainGoal],
  //     specific_goal: [frontendDevelopmentSpecificGoal],
  //     base_milestone_id: new mongoose.Types.ObjectId('659ec80ee3638572709ba470'),
  //   },
  //   {
  //     title: 'Version Control Best Practices',
  //     description: 'Adopt best practices for version control using Git.',
  //     estimated_time: { name: '2 weeks', value: 336 },
  //     experience_level: ['Beginner', 'Intermediate'],
  //     main_goal: [softwareDevelopmentMainGoal],
  //     specific_goal: [frontendDevelopmentSpecificGoal],
  //     base_milestone_id: new mongoose.Types.ObjectId('659ec80ee3638572709ba471'),
  //   },
  // ];

  // Sample MainGoal data
  const dataAnalyticsMainGoal = new mongoose.Types.ObjectId('659ec171bf031a2f14db42a3');

  // Sample SpecificGoal data
  const dataEngineeringSpecificGoal = new mongoose.Types.ObjectId('659ec171bf031a2f14db42ac');

  // Sample Milestones based on Data Analytics Engineer Roadmap
  const dataAnalyticsEngineerRoadmapMilestones = [
    {
      title: 'Learn SQL',
      description: 'Master SQL for querying and managing relational databases.',
      estimated_time: { name: '3 weeks', value: 504 },
      experience_level: ['Beginner', 'Intermediate'],
      main_goal: [dataAnalyticsMainGoal],
      specific_goal: [dataEngineeringSpecificGoal],
      base_milestone_id: new mongoose.Types.ObjectId('659ec80ee3638572709ba477'),
    },
    {
      title: 'Python for Data Analytics',
      description: 'Use Python for data analysis and manipulation.',
      estimated_time: { name: '4 weeks', value: 672 },
      experience_level: ['Beginner', 'Intermediate'],
      main_goal: [dataAnalyticsMainGoal],
      specific_goal: [dataEngineeringSpecificGoal],
      base_milestone_id: new mongoose.Types.ObjectId('659ec80ee3638572709ba478'),
    },
    {
      title: 'Data Visualization',
      description: 'Create compelling visualizations to communicate insights.',
      estimated_time: { name: '6 weeks', value: 1008 },
      experience_level: ['Beginner', 'Intermediate'],
      main_goal: [dataAnalyticsMainGoal],
      specific_goal: [dataEngineeringSpecificGoal],
      base_milestone_id: new mongoose.Types.ObjectId('659ec80ee3638572709ba479'),
    },
    {
      title: 'Machine Learning Basics',
      description: 'Understand the fundamentals of machine learning.',
      estimated_time: { name: '3 weeks', value: 504 },
      experience_level: ['Beginner', 'Intermediate'],
      main_goal: [dataAnalyticsMainGoal],
      specific_goal: [dataEngineeringSpecificGoal],
      base_milestone_id: new mongoose.Types.ObjectId('659ec80ee3638572709ba47a'),
    },
    {
      title: 'Big Data Technologies',
      description: 'Explore big data technologies like Apache Hadoop and Spark.',
      estimated_time: { name: '4 weeks', value: 672 },
      experience_level: ['Beginner', 'Intermediate'],
      main_goal: [dataAnalyticsMainGoal],
      specific_goal: [dataEngineeringSpecificGoal],
      base_milestone_id: new mongoose.Types.ObjectId('659ec80ee3638572709ba47b'),
    },
    {
      title: 'Data Visualization and Processing',
      description: 'Visualize Data.',
      estimated_time: { name: '4 weeks', value: 672 },
      experience_level: ['Advanced'],
      main_goal: [dataAnalyticsMainGoal],
      specific_goal: [dataEngineeringSpecificGoal],
      base_milestone_id: new mongoose.Types.ObjectId('659ec80ee3638572709ba47b'),
    },
    // Add more milestones as needed
  ];

  // Insert sample data into the database
  Milestone.insertMany(dataAnalyticsEngineerRoadmapMilestones);
};

const seedRoadmap = async () => {
  const softwareDevelopmentMainGoal = new mongoose.Types.ObjectId('659ec171bf031a2f14db42a2');
  const frontendDevelopmentSpecificGoal = new mongoose.Types.ObjectId('659ec171bf031a2f14db42a8');
  const backendDevelopmentSpecificGoal = new mongoose.Types.ObjectId('659ec171bf031a2f14db42a9');
  const dataScienceMainGoal = new mongoose.Types.ObjectId('659ec171bf031a2f14db42a3');
  const dataAnalyticsSpecificGoal = new mongoose.Types.ObjectId('659ec171bf031a2f14db42ac');
  const bigDataGoal = new mongoose.Types.ObjectId('659ec171bf031a2f14db42ad');

  const roadmaps = [
    {
      title: 'Frontend Dev for Beginner',
      description: 'Frontend Dev for Beginner',
      categoryId: softwareDevelopmentMainGoal,
      subCategoryId: frontendDevelopmentSpecificGoal,
      base_milestone: [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Base HTML/CSS/JS',
          order: 1,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Responsive Web Design',
          order: 2,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Version Control',
          order: 3,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Basic Understanding of Web Accessibility',
          order: 4,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Frameworks/Libraries',
          order: 5,
        },
      ],
    },
    {
      title: 'Backend Dev for Beginner',
      description: 'Backend Dev for Beginner',
      categoryId: softwareDevelopmentMainGoal,
      subCategoryId: backendDevelopmentSpecificGoal,
      base_milestone: [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Basic Understanding of How the Internet Works',
          order: 1,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Basic Understanding of Databases',
          order: 2,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Server-Side Programming Language',
          order: 3,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Web Security',
          order: 4,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Frameworks/Libraries',
          order: 5,
        },
      ],
    },
    {
      title: 'Backend Dev for Beginner',
      description: 'Backend Dev for Beginner',
      categoryId: dataScienceMainGoal,
      subCategoryId: dataAnalyticsSpecificGoal,
      base_milestone: [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Foundational Skills',
          order: 1,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Programming Languages',
          order: 2,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Explore Data Analysis Libraries',
          order: 3,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Simple Visualizations',
          order: 4,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Understand Basic Statistics',
          order: 5,
        },
      ],
    },
    {
      title: 'Backend Dev for Beginner',
      description: 'Backend Dev for Beginner',
      categoryId: dataScienceMainGoal,
      subCategoryId: bigDataGoal,
      base_milestone: [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Understand the Basics',
          order: 1,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Data Processing',
          order: 2,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Cloud Services',
          order: 3,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Data Save Place',
          order: 4,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Performance Optimization',
          order: 5,
        },
      ],
    },
  ];

  RoadmapTemplate.insertMany(roadmaps);
};

module.exports = {
  findRoadmap,
  buildRoadmap,
  createMilestone,
  fetchCategories,
  fetchSpecCategories,
  getUserRoadmap,
  getMilestoneModuleProgress,
  completeMilestone,
  seedCategory,
  seedMilestones,
  seedRoadmap,
  applyRoadmap,
};

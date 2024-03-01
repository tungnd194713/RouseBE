// const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { ModuleProgress, User, Module } = require('../models');

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

module.exports = {
  getCourse,
  updateModuleProgress,
  getUserCourse,
};

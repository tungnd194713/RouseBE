// const httpStatus = require('http-status');
const { Course, ModuleProgress } = require('../models');

const getCourse = async () => {
  const courses = await Course.findOne({});
  const moduleProgress = await ModuleProgress.findOne({});
  return {
    ...courses.toJSON(),
    moduleProgress,
  };
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
  await ModuleProgress.findByIdAndUpdate(moduleId, updateBody);
  return 'Success';
};

module.exports = {
  getCourse,
  updateModuleProgress,
};

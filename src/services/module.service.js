/* eslint-disable camelcase */
const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { Discussion, DiscussionReply, Note, ModuleTest, ModuleTestSubmission, ModuleProgress, Module } = require('../models');
const RoadMap = require('../models/roadmap.model');

const getNotes = async (module_id, user_id) => {
  const noteList = await Note.find({ module_id, user_id });
  return noteList;
};

const takeNote = async (module_id, user_id, body) => {
  const previousNote = await Note.find({
    module_id,
    user_id,
    noted_video_time: body.noted_video_time,
  });
  if (previousNote.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Note taken');
  }
  return Note.create({ ...body, module_id, user_id });
};

const editNote = async (module_id, user_id, body) => {
  const note = await Note.findOne({
    module_id,
    user_id,
    noted_video_time: body.noted_video_time,
  });
  if (note) {
    Object.assign(note, body);
    note.save();
    return note;
  }
  throw new ApiError(httpStatus.BAD_REQUEST, 'Note not found');
};

const createDiscussion = async (module_id, user_id, body) => {
  return Discussion.create({ ...body, module_id, user_id });
};

const replyDiscussion = async (module_id, user_id, discussion_id, body) => {
  const discussion = await Discussion.findById(discussion_id);
  const reply = await DiscussionReply.create({ ...body, module_id, user_id, discussion_id });

  if (discussion) {
    const replies = discussion.discussionReplies;
    replies.push(reply);
    Object.assign(discussion, { discussionReplies: replies });
    await discussion.save();
  }
  return reply.populate('user_id', 'name');
};

const getDiscussionByModule = async (module_id) => {
  return Discussion.find({ module_id })
    .populate('user_id', 'name')
    .populate({
      path: 'discussionReplies',
      populate: {
        path: 'user_id', // Populate the user properties in each discussionReply
        model: 'User',
      },
    });
};

const toggleUpvoteDiscussion = async (is_discussion, id, user_id) => {
  const model = is_discussion ? Discussion.findById(id) : DiscussionReply.findById(id);
  const upvoted_by = [...model.upvoted_by];
  const index = upvoted_by.indexOf(user_id);
  if (index > -1) {
    upvoted_by.splice(index, 1);
  } else {
    upvoted_by.push(user_id);
  }
  Object.assign(model, { upvoted_by });
  await model.save();
  return model;
};

const getExam = async (user_id, module_id) => {
  let result = await ModuleTestSubmission.findOne({ user_id, module_id }).populate('module_id', 'name').lean();
  if (result) {
    result.isSubmitted = true;
  } else {
    result = await ModuleTest.findOne({ module_id }).populate('module_id', 'name');
    result.questions = result.questions.map(({ correctAnswer, ...item }) => item);
    Object.assign(result, { isSubmitted: false });
  }
  return result;
};

const submitExam = async (user_id, exam_id, body) => {
  const exam = await ModuleTest.findById(exam_id);
  let correctAnswerNum = 0;
  const resultArr = body.map((item) => {
    const index = exam.questions.findIndex((q) => q._id === item._id);
    if (index > -1) {
      const question = exam.questions[index];
      if (question.correctAnswer === item.answer) {
        correctAnswerNum += 1;
        return {
          ...question,
          is_correct: true,
          user_choice: item.answer,
        };
      }
      return {
        ...question,
        is_correct: false,
        user_choice: item.answer,
      };
    }
    return 0;
  });
  const submission = await ModuleTestSubmission.create({
    user_id,
    module_id: exam.module_id,
    module_test_id: exam.id,
    questions: resultArr,
    correct_answers: correctAnswerNum,
    grade: (correctAnswerNum / exam.questions.length) * 100,
  });
  submission.isSubmitted = true;
  await ModuleProgress.findOneAndUpdate({ user_id, module_id: exam.module_id }, { exam_done: true });
  return submission;
};

const seedData = async () => {
  const roadmapData = [
    {
      name: 'Junior Full Stack Developer',
      description: 'How to become a frontend developer',
      mastery: 'Beginner',
      categoryId: 1,
      subCategoryId: 1,
      milestones: [
        {
          order: 1,
          title: 'HTML and CSS',
          estimated_time: 168,
          modules: [
            await Module.findOne({ name: 'HTML Basics' }),
            await Module.findOne({ name: 'CSS Fundamentals' }),
            await Module.findOne({ name: 'JavaScript Essentials' }),
          ],
        },
        {
          order: 2,
          title: 'NodeJS and Framework',
          estimated_time: 672,
          modules: [
            await Module.findOne({ name: 'MongoDB Basics' }),
            await Module.findOne({ name: 'Node.js Fundamentals' }),
            await Module.findOne({ name: 'Express.js Basics' }),
            await Module.findOne({ name: 'React Basics' }),
          ],
        },
        {
          order: 3,
          title: 'Deployment Manager',
          estimated_time: 336,
          modules: [await Module.findOne({ name: 'Docker Basics' }), await Module.findOne({ name: 'CI/CD Principles' })],
        },
      ],
    },
    // Add more roadmaps as needed
  ];
  await RoadMap.create(roadmapData);
};

module.exports = {
  getNotes,
  takeNote,
  editNote,
  createDiscussion,
  replyDiscussion,
  getDiscussionByModule,
  toggleUpvoteDiscussion,
  getExam,
  submitExam,
  seedData,
};

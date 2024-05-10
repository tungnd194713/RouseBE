const { MentorShift, Mentor, User } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const findMentor = async (params) => {
  // params = {
  //   weekdays: [
  //     { day: "monday", start_hour: new Date("2024-05-09T08:00:00"), end_hour: new Date("2024-05-09T10:00:00") },
  //     { day: "tuesday", start_hour: new Date("2024-05-10T10:00:00"), end_hour: new Date("2024-05-10T12:00:00") },
  //   ],
  //   subject: id,
  //   level: number(1, 2, 3)
  // }

  const individualQueries = params.weekdays.map(({ day, start_hour, end_hour }) => ({
    [`weekdays.${day}.start_hour`]: { $lte: start_hour },
    [`weekdays.${day}.end_hour`]: { $gte: end_hour }
  }));

  const orDateFilters = []
  params.weekdays.forEach((item) => {
    const filter = {};
    filter[`weekdays.${item.day}.start_hour`] = { $lte: item.start_hour };
    filter[`weekdays.${item.day}.end_hour`] = { $gte: item.end_hour };
    orDateFilters.push(filter);
  })

  const data = await Mentor.find({
    $or: orDateFilters,
    start_working_date: { $lte: Date.now() },
    end_working_date: { $gte: Date.now() },
    status: 1,
    specialized_fields: {
      $elemMatch: {
        subject: params.subject, // Filter by subject within specialized_fields array
        level: { $gte: params.level } // Filter by level within specialized_fields array
      }
    },
  })
}

const updateProfile = async (userId, data) => {
  // specialized_skills = JSON([
  //   {
  //     subject: id1,
  //     level: 1,
  //   },
  //   {
  //     subject: id2,
  //     level: 2
  //   }
  // ])
  const user = await User.findById(userId);
  if (user.role !== 'mentor') throw new ApiError(httpStatus.BAD_REQUEST, 'Not a mentor');

  const mentor = await Mentor.findOne({ user: userId });
  if (!mentor) throw new ApiError(httpStatus.BAD_REQUEST, 'Not a mentor');

  const updateBody = {
    ...data,
    specialized_fields: JSON.parse(data.specialized_fields),
  }
  Object.assign(mentor, updateBody);
  await mentor.save();

  return 'Mentor profile updated!';
}

const getMentorShifts = async (userId, params, options) => {
  const mentor = await Mentor.findOne({ user: userId });
  if (!mentor) throw new ApiError(httpStatus.BAD_REQUEST, 'Not a mentor');

  const filter = {
    mentor: mentor._id || mentor.id,
  }
  if (params.is_finished !== null) {
    filter.is_finished = params.is_finished;
  }
  const queryOptions = {
    ...options
  }
  return MentorShift.paginate(filter, queryOptions)
}

module.exports = {
  updateProfile,
  getMentorShifts,
};


const { MentorShift, Mentor, User } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');

const convertHourToNumber = (hourString) => {
  const [hour, minute] = hourString.split(":").map(Number);
  return hour + minute / 60;
}

const findMentor = async (params) => {
  const query = {
    start_working_date: { $lte: Date.now() },
    // end_working_date: { $gte: Date.now() },
    status: 1,
    specialized_fields: {
      $elemMatch: {
        subject: params.subject, // Filter by subject within specialized_fields array
        level: { $gte: params.level } // Filter by level within specialized_fields array
      }
    },
  }
  query[`weekdays.${params.day}.start_hour`] = { $lte: convertHourToNumber(params.start_hour) };
  query[`weekdays.${params.day}.end_hour`] = { $gte: convertHourToNumber(params.end_hour) };

  const mentors = await Mentor.find(query).populate('shifts ratings');
  mentors.forEach(mentor => {
    let totalRating = 0;
    let ratingCount = 0;

    mentor.ratings.forEach(rating => {
      totalRating += rating.rating_star;
      ratingCount++;
    });

    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    mentor.averageRating = averageRating; // Assign average rating to mentor object
  });

  return mentors;
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
  findMentor,
  updateProfile,
  getMentorShifts,
};


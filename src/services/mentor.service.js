const { MentorShift, Mentor, User, Course } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const mongoose = require('mongoose');

const seedMentor = async () => {
	const data = [
		{
			user: mongoose.Types.ObjectId('663d898bded84a19dd91ee52'),
			facebook_link: "https://www.facebook.com/mentor2",
			twitter_link: "https://twitter.com/mentor2",
			biography: "I have a strong background in computer science and love to teach programming.",
			specialized_fields: [],
			start_working_date: new Date("2022-06-01"),
			end_working_date: new Date("2024-12-31"),
			weekdays: {
				tuesday: {
					start_hour: new Date("2024-05-10T10:00:00"),
					end_hour: new Date("2024-05-10T18:00:00"),
				},
				thursday: {
					start_hour: new Date("2024-05-12T11:00:00"),
					end_hour: new Date("2024-05-12T19:00:00"),
				},
				friday: {
					start_hour: new Date("2024-05-13T09:00:00"),
					end_hour: new Date("2024-05-13T16:00:00"),
				},
				saturday: {
					start_hour: new Date("2024-05-14T10:30:00"),
					end_hour: new Date("2024-05-14T15:30:00"),
				},
			}
		},
		// {
		// 	user: "3456789012",
		// 	facebook_link: "https://www.facebook.com/mentor3",
		// 	twitter_link: "https://twitter.com/mentor3",
		// 	biography: "I am passionate about literature and enjoy helping students explore classic works.",
		// 	specialized_fields: [{
		// 		subject: "345678901", // Assuming another subject ID
		// 		level: "Beginner",
		// 	}],
		// 	start_working_date: new Date("2023-03-15"),
		// 	end_working_date: new Date("2024-10-31"),
		// 	weekdays: {
		// 		monday: {
		// 			start_hour: new Date("2024-05-09T09:00:00"),
		// 			end_hour: new Date("2024-05-09T17:00:00"),
		// 		},
		// 		wednesday: {
		// 			start_hour: new Date("2024-05-11T09:30:00"),
		// 			end_hour: new Date("2024-05-11T16:30:00"),
		// 		},
		// 		friday: {
		// 			start_hour: new Date("2024-05-13T09:00:00"),
		// 			end_hour: new Date("2024-05-13T16:00:00"),
		// 		},
		// 	}
		// }
	]

	try {
		await Mentor.insertMany(data);
		return 'Mentors added!';
	} catch (e) {
		throw new ApiError(httpStatus.BAD_REQUEST, e)
	}
}

const convertHourToNumber = (hourString) => {
  const [hour, minute] = hourString.split(":").map(Number);
  return hour + minute / 60;
}

const getWeekdayName = () => {
  const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayIndex = new Date().getDay();
  return daysOfWeek[dayIndex];
}

const getCurrentHour = () => {
  const now = new Date();
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  return convertHourToNumber(`${hour}:${minute}`);
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

const getProfile = async (userId) => {
	return Mentor.findOne({ user: userId }).populate('ratings');
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
    mentor: mentor._id,
  }
	if (params.status) {
		filter.status = params.status;
	}
  if (params.is_today) {
    filter[`weekdays.${getWeekdayName()}.start_hour`] = { $lte: getCurrentHour() };
    filter[`weekdays.${getWeekdayName()}.end_hour`] = { $gte: getCurrentHour() };
  }
  if (params.day) {
    filter[`weekdays.${params.day}.start_hour`] = { $ne: null };
    filter[`weekdays.${params.day}.end_hour`] = { $ne: null };
  }
  const queryOptions = {
    ...options,
		populate: 'user course'
  }
  return MentorShift.paginate(filter, queryOptions)
}

const acceptMentorShift = async (userId, mentorShiftId) => {
	const mentor = await Mentor.findOne({ user: userId });
  if (!mentor) throw new ApiError(httpStatus.BAD_REQUEST, 'Not a mentor');

	const mentorShift = await MentorShift.findOne({ mentor: mentor._id, _id: mentorShiftId });
  if (!mentorShift) throw new ApiError(httpStatus.BAD_REQUEST, 'Not a mentor');

	mentorShift.status = 2;
	mentorShift.date_start = Date.now();
	await mentorShift.save();

	return 'Shift accepted!';
}

const rejectMentorShift = async (userId, mentorShiftId) => {
	const mentor = await Mentor.findOne({ user: userId });
  if (!mentor) throw new ApiError(httpStatus.BAD_REQUEST, 'Not a mentor');

	const mentorShift = await MentorShift.findOne({ mentor: mentor._id, _id: mentorShiftId });
  if (!mentorShift) throw new ApiError(httpStatus.BAD_REQUEST, 'Not a mentor');

	mentorShift.status = 4;
	await mentorShift.save();

	return 'Shift rejected!';
}

const showCourse = async (userId, courseId) => {
  const mentor = await Mentor.findOne({ user: userId });
  if (!mentor) throw new ApiError(httpStatus.BAD_REQUEST, 'Not a mentor');

	const mentorShift = await MentorShift.findOne({ mentor: mentor._id, course: courseId });
  if (!mentorShift) throw new ApiError(httpStatus.BAD_REQUEST, 'Not authorized');

  const course = await Course.findById(courseId).populate('modules skill_tags.skill');
  return course;
}

module.exports = {
  findMentor,
	seedMentor,
	getProfile,
  updateProfile,
  getMentorShifts,
	acceptMentorShift,
	rejectMentorShift,
	showCourse,
};


const { MentorShift, Mentor, User, Course, MentorRating, Subject } = require('../models');
const ApiError = require('../utils/ApiError');
const httpStatus = require('http-status');
const mongoose = require('mongoose');

const getRandomItems = (arr, numItems = 5) => {
  if (numItems > arr.length) {
    throw new Error("Number of items to pick is greater than the array length");
  }

  const shuffled = arr.slice(); // Copy the array to avoid mutating the original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, numItems);
}

const seedMentor = async () => {
  // const session = await mongoose.startSession();
  // session.startTransaction();

  // try {
  //   const vietnameseNames = ["Nguyen Van An", "Tran Thi Binh", "Le Hoang Cuong", "Pham Ngoc Duong", "Hoang Thi Em", "Vu Minh Phuong", "Doan Ngoc Han", "Dang Quoc Bao", "Dinh Thi Mai", "Ngo Thanh Hoa", "Bui Van Duy", "Ly Thi Lan", "Tran Van Thanh", "Nguyen Thi Thu", "Pham Tuan Kiet", "Vu Hoai Nam", "Le Van Quang", "Hoang Thi Linh", "Nguyen Thanh Phong", "Tran Thi Ngoc", "Pham Van Khanh", "Le Minh Chau", "Vu Thi Hong", "Doan Van Tam", "Dang Thi Hue", "Dinh Hoai Bac", "Ngo Thi Anh", "Bui Van Phuc", "Ly Thi Thu", "Tran Hoang Hai", "Nguyen Thi Mai", "Pham Van Thang", "Vu Thi Lan", "Le Van Dung", "Hoang Minh Tri", "Nguyen Thi Hanh", "Tran Van Hieu", "Pham Minh Tu", "Vu Thi Nga", "Doan Van Hieu", "Dang Thi Dao", "Dinh Thi Huong", "Ngo Van Huy", "Bui Thi Hang", "Ly Van Lam", "Tran Van Tai", "Nguyen Thi Kim", "Pham Van Hung", "Vu Thi Thuy", "Pham Van Ninh"];
  //   const vietnamesePhoneNumbers = [
  //     "0901234567", "0912345678", "0923456789", "0934567890", "0945678901",
  //     "0956789012", "0967890123", "0978901234", "0989012345", "0990123456",
  //     "0901122334", "0912233445", "0923344556", "0934455667", "0945566778",
  //     "0956677889", "0967788990", "0978899001", "0989900112", "0990011223",
  //     "0902233445", "0913344556", "0924455667", "0935566778", "0946677889",
  //     "0957788990", "0968899001", "0979900112", "0980011223", "0991122334",
  //     "0903344556", "0914455667", "0925566778", "0936677889", "0947788990",
  //     "0958899001", "0969900112", "0970011223", "0981122334", "0992233445",
  //     "0904455667", "0915566778", "0926677889", "0937788990", "0948899001",
  //     "0959900112", "0960011223", "0971122334", "0982233445", "0993344556",
  //     "0808765234",
  //   ];

  //   const userData = [];
  //   for (let i = 1; i <= 50; ++i) {
  //     userData.push({
  //       name: vietnameseNames[i - 1],
  //       birthday: new Date(1988, 0, 23),
  //       phone_number: vietnamesePhoneNumbers[i - 1],
  //       email: `mentors${i}@gmail.com`,
  //       password: '$2a$12$.RqbOfwSz/hf.vWGItjU/.PebYP4Ew8Er1NF.rrkOMvakRS7Psftu',
  //       role: 'mentor',
  //     });
  //   }

  //   const users = await User.insertMany(userData, { session });
  //   const userIds = users.map((item) => item.id || item._id);
  //   if (userIds && userIds.length) {
  //     const mentorData = [];
  //     const skillSets = await Subject.find({}, null, { session });
  //     userIds.forEach((userId, index) => {
  //       const pickedSkills = getRandomItems(skillSets);
  //       const pickedFields = pickedSkills.map((item) => {
  //         return {
  //           subject: item.id || item._id,
  //           level: 3,
  //         };
  //       });
  //       mentorData.push({
  //         user: userId,
  //         mentor_name: vietnameseNames[index - 1],
  //         facebook_link: `https://www.facebook.com/mentor${index + 3}`,
  //         twitter_link: `https://twitter.com/mentor${index + 3}`,
  //         biography: "I have a strong background in computer science and love to teach programming.",
  //         zalo_number: vietnamesePhoneNumbers[index - 1],
  //         specialized_fields: pickedFields,
  //         start_working_date: new Date("2022-06-01"),
  //         end_working_date: new Date("2025-12-31"),
  //         weekdays: {
  //           monday: {
  //             start_hour: new Date("2024-05-10T10:00:00"),
  //             end_hour: new Date("2024-05-10T18:00:00"),
  //           },
  //           tuesday: {
  //             start_hour: new Date("2024-05-10T10:00:00"),
  //             end_hour: new Date("2024-05-10T18:00:00"),
  //           },
  //           thursday: {
  //             start_hour: new Date("2024-05-12T11:00:00"),
  //             end_hour: new Date("2024-05-12T19:00:00"),
  //           },
  //           friday: {
  //             start_hour: new Date("2024-05-13T09:00:00"),
  //             end_hour: new Date("2024-05-13T16:00:00"),
  //           },
  //           saturday: {
  //             start_hour: new Date("2024-05-14T10:30:00"),
  //             end_hour: new Date("2024-05-14T15:30:00"),
  //           },
  //         }
  //       });
  //     });

  //     const mentors = await Mentor.insertMany(mentorData, { session });
  //     await session.commitTransaction();
  //     return mentors;
  //   }
  // } catch (e) {
  //   await session.abortTransaction();
  //   throw new ApiError(httpStatus.BAD_REQUEST, e.message);
  // } finally {
  //   session.endSession();
  // }
};

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
  if (params.day) {
    query[`weekdays.${params.day}.start_hour`] = { $ne: null };
    query[`weekdays.${params.day}.end_hour`] = { $ne: null };
    if (params.start_hour) {
      query[`weekdays.${params.day}.start_hour`] = { $lte: convertHourToNumber(params.start_hour) };
    }
    if (params.end_hour) {
      query[`weekdays.${params.day}.end_hour`] = { $gte: convertHourToNumber(params.end_hour) };
    }
  }


  let mentors = await Mentor.find(query).populate('shifts ratings');
  if (params.avgRating) {
    mentors = mentors.filter((item) => item.avgRating >= params.avgRating)
  }

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
    filter[`shift_days.${getWeekdayName()}.start_hour`] = { $lte: getCurrentHour() };
    filter[`shift_days.${getWeekdayName()}.end_hour`] = { $gte: getCurrentHour() };
  }
  if (params.day) {
    filter[`shift_days.${params.day}.start_hour`] = { $ne: null };
    filter[`shift_days.${params.day}.end_hour`] = { $ne: null };
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

const updateShift = async (userId, shift) => {
  const mentor = await Mentor.findOne({ user: userId });
  if (!mentor) throw new ApiError(httpStatus.BAD_REQUEST, 'Not a mentor');

	const daysOfWeek = [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday"
	];

	if (!daysOfWeek.includes(shift.weekday)) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid shift');

	mentor.weekdays[shift.weekday] = {
		start_hour: shift.start_hour,
		end_hour: shift.end_hour,
	}

	await mentor.save();
  return mentor;
}

const deleteShift = async (userId, weekday) => {
	const mentor = await Mentor.findOne({ user: userId });
  if (!mentor) throw new ApiError(httpStatus.BAD_REQUEST, 'Not a mentor');

	const daysOfWeek = [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday"
	];

	if (!daysOfWeek.includes(weekday)) throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid shift');

	mentor.weekdays[weekday] = {};

	await mentor.save();
  return mentor;
}

const getRatingList = async (userId, params, options) => {
	const mentor = await Mentor.findOne({ user: userId });
  if (!mentor) throw new ApiError(httpStatus.BAD_REQUEST, 'Not a mentor');

	const filter = {
    mentor: mentor._id,
  }
	if (params.rating_star) {
		filter.rating_star = params.rating_star;
	}
  const queryOptions = {
    ...options,
		populate: 'user course'
  }
  return MentorRating.paginate(filter, queryOptions)
}

const getMentors = async (params, options) => {
	const currentDay = new Date();

	const filter = {}
	const queryOptions = {
    ...options,
		populate: 'user,ratings,shifts',
  }
  const paginatedCollection = await Mentor.paginate(filter, queryOptions)
	const mentors = paginatedCollection.results.map(mentor => {
    const totalHours = mentor.shifts.reduce((total, shift) => {
      const shiftStartDate = new Date(shift.date_start);
      const shiftEndDate = shift.is_finished ? new Date(shift.date_end) : currentDay;

      let totalShiftHours = 0;

      // Iterate through each week from shiftStartDate to shiftEndDate
      for (let date = new Date(shiftStartDate); date <= shiftEndDate; date.setDate(date.getDate() + 7)) {
        totalShiftHours += calculateWeeklyHours(shift.shift_days);
      }

      return total + totalShiftHours;
    }, 0);

    return {
      ...mentor.toObject(),
      totalWorkHours: totalHours,
			name: mentor.user.name,
			shift_count: mentor.shifts.length,
			email: mentor.user.email,
      status: mentor.user.status
    };
  });
	return mentors;
}

function calculateWeeklyHours(shiftDays) {
  return Object.values(shiftDays).reduce((total, day) => {
    if (day.start_hour != null && day.end_hour != null) {
      return total + (day.end_hour - day.start_hour);
    }
    return total;
  }, 0);
}

const updateMentorShift = async (shiftId, body) => {
	try {
		return MentorShift.findByIdAndUpdate(shiftId, { $set: body });
	} catch (e) {
		throw new ApiError(httpStatus.BAD_REQUEST, 'Shift not found');
	}
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
	updateShift,
	deleteShift,
	getRatingList,
	getMentors,
	updateMentorShift,
};


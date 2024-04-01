const httpStatus = require('http-status');
const { User, UserProfile } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  return User.create(userBody);
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  const users = await User.paginate(filter, options);
  return users;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  return User.findById(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  return User.findOne({ email });
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  if (updateBody.email && (await User.isEmailTaken(updateBody.email, userId))) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  await user.remove();
  return user;
};

const getUserProfile = async (userId) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  let profile = await UserProfile.findOne({user: userId}).populate('skills.skill');
  let candidate = {...user.toObject()};
  if (profile) {
    candidate = {...user.toObject(), ...profile.toObject()};
  }

  return {
    candidate,
  }
}

const updateUserProfile = async (userId, body) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  let profile = await UserProfile.findOne({user: userId});
  if (!profile) {
    profile = await UserProfile.create({user: userId});
  }

  const skills = JSON.parse(body.skills);
  const beginnerSkills = skills.beginner.map((item) => {
    return {
      level: 'Beginner',
      skill: item,
    }
  })
  const intermediateSkills = skills.intermediate.map((item) => {
    return {
      level: 'Intermediate',
      skill: item,
    }
  })
  const advancedSkills = skills.advanced.map((item) => {
    return {
      level: 'Advanced',
      skill: item,
    }
  })
  const skillData = [].concat(beginnerSkills).concat(intermediateSkills).concat(advancedSkills);
  if (body?.educations) {
    profile.educations = body?.educations;
  }
  if (body?.certificates) {
    profile.certificates = body?.certificates;
  }
  if (skillData) {
    profile.skills = skillData;
  }
  if (body?.jobs) {
    profile.working_experiences = body?.jobs;
  }
  profile.introduction = body?.strength;

  await profile.save();
}

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  getUserProfile,
  updateUserProfile,
};

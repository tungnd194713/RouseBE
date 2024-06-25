const { Instructor, User } = require('../models');

const addInstructor = async (user) => {
  return Instructor.create({
    user: user.id,
    instructor_name: user.name,
  });
}

module.exports = {
  addInstructor,
};


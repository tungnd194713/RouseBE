const allRoles = {
  user: [],
  admin: ['getUsers', 'manageUsers', 'manageCompanies'],
  company: [],
  mentor: [],
  instructor: [],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};

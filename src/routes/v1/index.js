const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const docsRoute = require('./docs.route');
const surveyRoute = require('./survey.route');
const roadmapRoute = require('./roadmap.route');
const courseRoute = require('./course.route');
const companyRoute = require('./company.route');
const subjectRoute = require('./subject.route');
const config = require('../../config/config');

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/course',
    route: courseRoute,
  },
  {
    path: '/roadmap',
    route: roadmapRoute,
  },
	{
    path: '/survey',
    route: surveyRoute,
  },
	{
    path: '/companies',
    route: companyRoute,
  },
	{
    path: '/technical',
    route: subjectRoute,
  },
];

const devRoutes = [
  // routes available only in development mode
  {
    path: '/docs',
    route: docsRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

/* istanbul ignore next */
if (config.env === 'development') {
  devRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });
}

module.exports = router;

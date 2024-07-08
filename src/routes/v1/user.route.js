const express = require('express');
const multer  = require('multer')
const upload = multer()
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const userValidation = require('../../validations/user.validation');
const userController = require('../../controllers/user.controller');
const myCustomStorage = require("../../helpers/storage.helper");

const router = express.Router();

let FileStorage = myCustomStorage({
  destination: function (req, file, cb) {
    cb(null);
  },
});

let uploadFile = multer({
  storage: FileStorage,
});

router
  .route('/')
  .post(auth('manageUsers'), validate(userValidation.createUser), userController.createUser)
  .get(auth('getUsers'), validate(userValidation.getUsers), userController.getUsers);

router
  .route('/:userId')
  // .get(auth('getUsers'), validate(userValidation.getUser), userController.getUser)
  .delete(auth('manageUsers'), validate(userValidation.deleteUser), userController.deleteUser)
	.put(auth(), validate(), userController.editUser);

router.get('/profile/', auth(), userController.getUserProfile);
router.get('/profile/user-options', auth(), userController.getUserOptions);
router.get('/me', auth(), userController.getUser);
router.post('/update-image', uploadFile.single('file'), auth(), userController.uploadAvatar);
router.post('/profile/update-info-basic', upload.none(), auth(), userController.updateUser);
router.post('/profile/update-info-advanced', upload.none(), auth(), userController.updateUserProfile);
router.get('/jobs/:jobId/matching-point', auth(), userController.getJobMatchingPoint);
router.post('/jobs/find', auth(), userController.findJob);
router.post('/jobs/list', userController.getListJob);
router.post('/jobs/suggest', auth(), userController.suggestJobs);
router.get('/jobs/:jobId', auth(), userController.getDetailJob);
router.post('/candidate-applies/', upload.none(), auth(), userController.applyJob);
router.post('/candidate-applies/:candidateApplyId/start-education', auth(), userController.startJobEducation);
router.post('/candidate-applies/:candidateApplyId/refuse-education', auth(), userController.refuseJobEducation);
router.get('/educations/list', auth(), userController.getUserRoadmapList);
router.get('/educations/detail/:roadmapId', auth(), userController.getRoadmapDetail);
router.get('/educations/current', auth(), userController.getCurrentEducation);
router.post('/educations/:roadmapId/courses/:courseId/unlock', auth(), userController.unlockRoadmapCourse);
router.post('/educations/courses/:courseId/request-mentors', auth(), userController.requestMentor);
router.put('/educations/courses/:courseId/end-shifts/:shiftId', auth(), userController.endMentorRequest);
router.post('/educations/rating-mentor', auth(), userController.addMentorRating);
router.get('/educations/:roadmapId/courses/:courseId/modules/:moduleId', auth(), userController.getUserModule);
router.get('/educations/:roadmapId/courses/:courseId/modules/:moduleId/watched', auth(), userController.watchedModule);
router.post('/jobs/list/applied', auth(), userController.getAppliedJobs);
router.get('/educations/courses/:courseId/tests/:testId/sheets', auth(), userController.getUserAnswerSheet);
router.get('/educations/:roadmapId/courses/:courseId/tests/:testId/', auth(), userController.getTestById);
router.post('/educations/tests/:testId/sheets/create', auth(), userController.createAnswerSheet);
router.put('/educations/sheets/:answerSheetId', auth(), userController.updateAnswerSheetById);
router.get('/educations/sheets/:answerSheetId', auth(), userController.getAnswerSheetById);
router.put('/educations/:roadmapId/courses/:courseId/sheets/:answerSheetId/submit', auth(), userController.submitAnswerSheet);
router.get('/educations/check-roadmap', auth(), userController.checkJobEducationExisted);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management and retrieval
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a user
 *     description: Only admins can create other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *               role:
 *                  type: string
 *                  enum: [user, admin]
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *               role: user
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *
 *   get:
 *     summary: Get all users
 *     description: Only admins can retrieve all users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: User name
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: User role
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: sort by query in the form of field:desc/asc (ex. name:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of users
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get a user
 *     description: Logged in users can fetch only their own user information. Only admins can fetch other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a user
 *     description: Logged in users can only update their own information. Only admins can update other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *                 description: must be unique
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 description: At least one number and one letter
 *             example:
 *               name: fake name
 *               email: fake@example.com
 *               password: password1
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/User'
 *       "400":
 *         $ref: '#/components/responses/DuplicateEmail'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a user
 *     description: Logged in users can delete only themselves. Only admins can delete other users.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User id
 *     responses:
 *       "200":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "403":
 *         $ref: '#/components/responses/Forbidden'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

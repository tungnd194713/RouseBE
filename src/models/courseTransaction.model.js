const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const courseTransactionSchema = mongoose.Schema(
  {
		user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
		},
		course: {
			type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
		},
		jobEducation: {
			type: mongoose.Schema.Types.ObjectId,
      ref: "JobEducation",
		},
		// userRoadmap: {
		// 	type: mongoose.Schema.Types.ObjectId,
    //   ref: "UserRoadmap",
		// },
		paid_point: {
			type: Number,
			required: true,
		},
		course_point: {
			type: Number,
			required: true,
		},
		scholarship: {
			type: Number,
			default: 0,
		},
		scholarship_paid: {
			type: Boolean,
			default: true,
		}
  },
  {
    timestamps: true,
    toObject: { getters: true, setters: true, virtual: true },
    toJSON: { getters: true, setters: true, virtual: true },
  }
);

// add plugin that converts mongoose to json
courseTransactionSchema.plugin(toJSON);
courseTransactionSchema.plugin(paginate);

/**
 * @typedef CourseTransaction
 */
const CourseTransaction = mongoose.model('CourseTransaction', courseTransactionSchema);

module.exports = CourseTransaction;

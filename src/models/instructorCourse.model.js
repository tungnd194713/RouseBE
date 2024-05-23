const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const instructorCourseSchema = mongoose.Schema({
  instructor: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Instructor'
  },
  jobEducation: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'JobEducation'
  },
  course: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Course'
  },
  deadline: {
    type: Date,
    required: true,
  },
  requirement: {
    type: String,
    required: true,
  },
  is_done: {
    type: Boolean,
    default: false,
  },
  done_date: {
    type: Date,
  },
  is_read: {
    type: Boolean,
    default: false,
  },
  status: {
    type: Number,
    default: 0,
    enum: [0, 1, 2, 3], //0: In progress, 1: Reviewing, 2: Approved, 3: Reject
  },
  reviews: [
    {
      content: String,
      created_at: {
        type: Date,
        default: Date.now(),
      },
      created_by: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User'
      },
      is_resolved: {
        type: Boolean,
        default: false,
      }
    }
  ],
},
{
  timestamps: true,
  toObject: { getters: true, setters: true, virtual: true },
  toJSON: { getters: true, setters: true, virtual: true },
}
);

instructorCourseSchema.plugin(toJSON);
instructorCourseSchema.plugin(paginate);

const InstructorCourse = mongoose.model('InstructorCourse', instructorCourseSchema);

module.exports = InstructorCourse;

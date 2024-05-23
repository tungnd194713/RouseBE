const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const instructorSchema = mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  instructor_name: {
    type: String,
  },
  specialized_fields: [{
    subject: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Subject'
    },
    level: {
      type: Number,
      enum: [1, 2, 3], //1: Beginner, 2: Intermediate, 3: Advanced
      default: 3,
    }
  }],
  start_working_date: Date,
  end_working_date: Date,
},
{
  timestamps: true,
  toObject: { getters: true, setters: true, virtual: true },
  toJSON: { getters: true, setters: true, virtual: true },
}
);

instructorSchema.plugin(toJSON);
instructorSchema.plugin(paginate);

const Instructor = mongoose.model('Instructor', instructorSchema);

module.exports = Instructor;

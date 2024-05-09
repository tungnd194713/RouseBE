const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { toJSON, paginate } = require('./plugins');

const mentorShiftSchema = new Schema({
  mentor: {
    type: Schema.Types.ObjectId,
    ref: 'Mentor',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  date_start: Date,
  date_end: Date,
  is_finished: Boolean,
  shift_days: {
    monday: {
      start_hour: Date,
      end_hour: Date,
    },
    tuesday: {
      start_hour: Date,
      end_hour: Date,
    },
    wednesday: {
      start_hour: Date,
      end_hour: Date,
    },
    thursday: {
      start_hour: Date,
      end_hour: Date,
    },
    friday: {
      start_hour: Date,
      end_hour: Date,
    },
    saturday: {
      start_hour: Date,
      end_hour: Date,
    },
    sunday: {
      start_hour: Date,
      end_hour: Date,
    },
  }
},
{
  timestamps: true,
});

mentorShiftSchema.plugin(toJSON);
mentorShiftSchema.plugin(paginate);

const MentorShift = mongoose.model('MentorShift', mentorShiftSchema);

module.exports = MentorShift;

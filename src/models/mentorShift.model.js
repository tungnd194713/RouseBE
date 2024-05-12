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
  status: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4], // 1: Gửi yêu cầu, 2: Đang hỗ trợ, 3: Đã hoàn thành, 4: Đã từ chối
  },
  date_start: Date,
  date_end: Date,
  is_finished: Boolean,
  shift_days: {
    monday: {
      start_hour: Number,
      end_hour: Number,
    },
    tuesday: {
      start_hour: Number,
      end_hour: Number,
    },
    wednesday: {
      start_hour: Number,
      end_hour: Number,
    },
    thursday: {
      start_hour: Number,
      end_hour: Number,
    },
    friday: {
      start_hour: Number,
      end_hour: Number,
    },
    saturday: {
      start_hour: Number,
      end_hour: Number,
    },
    sunday: {
      start_hour: Number,
      end_hour: Number,
    },
    day_of_week: {
      type: String,
    }
  },
},
{
  timestamps: true,
});

mentorShiftSchema.plugin(toJSON);
mentorShiftSchema.plugin(paginate);

const MentorShift = mongoose.model('MentorShift', mentorShiftSchema);

module.exports = MentorShift;

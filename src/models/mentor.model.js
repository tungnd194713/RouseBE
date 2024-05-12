const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { toJSON, paginate } = require('./plugins');

const mentorSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  mentor_name: String,
  zalo_number: String,
  facebook_link: String,
  twitter_link: String,
  biography: String,
  specialized_fields: [{
    subject: {
      type: Schema.Types.ObjectId,
      ref: 'Subject'
    },
    level: {
      type: Number,
      enum: [1, 2, 3] //1: Beginner, 2: Intermediate, 3: Advanced
    }
  }],
  start_working_date: Date,
  end_working_date: Date,
  status: {
    type: Number,
    enum: [1, 2, 3],
  },
  weekdays: {
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
    }
  }
},
{
  timestamps: true,
}
);

mentorSchema.virtual('ratings', {
  ref: 'MentorRating',
  localField: '_id',
  foreignField: 'mentor',
});

mentorSchema.virtual('shifts', {
  ref: 'MentorShift',
  localField: '_id',
  foreignField: 'mentor',
});

mentorSchema.plugin(toJSON);
mentorSchema.plugin(paginate);

const Mentor = mongoose.model('Mentor', mentorSchema);

module.exports = Mentor;

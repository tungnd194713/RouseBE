const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const mentorSchema = mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  mentor_name: String,
  zalo_number: String,
  facebook_link: String,
  twitter_link: String,
  biography: String,
  specialized_fields: [{
    subject: {
      type: mongoose.SchemaTypes.ObjectId,
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
  toObject: { getters: true, setters: true, virtual: true },
  toJSON: { getters: true, setters: true, virtual: true },
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

mentorSchema.virtual('avgRating').get(function() {
  if (this.ratings && this.ratings.length > 0) {
    const totalRating = this.ratings.reduce((acc, rating) => acc + rating.rating_star, 0);
    return totalRating / this.ratings.length;
  } else {
    return 0;
  }
});

mentorSchema.plugin(toJSON);
mentorSchema.plugin(paginate);

const Mentor = mongoose.model('Mentor', mentorSchema);

module.exports = Mentor;

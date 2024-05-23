const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const mentorRatingSchema = mongoose.Schema({
  mentor: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Mentor',
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
	mentorShift: {
		type: mongoose.SchemaTypes.ObjectId,
    ref: 'MentorShift'
	},
	course: {
		type: mongoose.SchemaTypes.ObjectId,
    ref: 'Course'
	},
  rating_star: Number,
  rating_content: String,
},
{
  timestamps: true,
});

mentorRatingSchema.plugin(toJSON);
mentorRatingSchema.plugin(paginate);

const MentorRating = mongoose.model('MentorRating', mentorRatingSchema);

module.exports = MentorRating;

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { toJSON, paginate } = require('./plugins');

const mentorRatingSchema = new Schema({
  mentor: {
    type: Schema.Types.ObjectId,
    ref: 'Mentor',
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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

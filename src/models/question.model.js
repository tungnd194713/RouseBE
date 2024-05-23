const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const Schema = mongoose.Schema;

const choiceSchema = new Schema({
    content: {
        type: String,
    },
    isTrue: { type: Boolean, private: true }
}, {
    toObject: { getters: true },
    toJSON: { getters: true },
})

const questionSchema = new Schema({
    question: {
        type: String,
    },
    choices: [choiceSchema],
    answer: {
      type: String,
    },
    grade: Number,
}, {
    timestamps: true,
    toObject: { getters: true, setters: true, virtual: true },
    toJSON: { getters: true, setters: true, virtual: true },
}
);

questionSchema.methods.getTrueChoiceArray = function () {
    return this.choices.filter(c => c.isTrue).map(c => String(c._id));
}

questionSchema.methods.getFalseChoiceArray = function () {
    return this.choices.filter(c => !c.isTrue).map(c => String(c._id));
}

questionSchema.pre('remove', async function(next) {
  try {
    await mongoose.model('Test').updateMany(
      { questions: this._id },
      { $pull: { questions: this._id } }
    );
    next();
  } catch (err) {
    next(err);
  }
});

questionSchema.plugin(paginate);

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;

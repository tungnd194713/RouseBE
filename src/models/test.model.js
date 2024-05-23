const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const Schema = mongoose.Schema;

const testSchema = new Schema(
  {
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    time: Number,
    name: String,
    grade: { type: Number },
    note: {
      type: String,
    },
    isShuffled: {
      type: Boolean,
      default: false,
    },
    isSorted: {
      type: Boolean,
      default: true,
    },
    showKeyMode: {
      type: Number,
      default: 2,
      enums: [0, 1, 2], // 0: only mark, 1: show false option, 2: show full
    },
  },
  {
    timestamps: true,
    // toObject: { getters: true, setters: true, virtual: true },
    // toJSON: { getters: true, setters: true, virtual: true },
  }
);

testSchema.methods.getKey = function () {
  if (!this.populated("questions")) return [];
  const key = [];
  this.questions.forEach((q) => {
    key.push(...q.getTrueChoiceArray());
  });
  return key;
};

testSchema.pre('remove', async function(next) {
  try {
    await mongoose.model('Course').updateMany(
      { tests: this._id },
      { $pull: { tests: this._id } }
    );
    next();
  } catch (err) {
    next(err);
  }
});

testSchema.plugin(paginate);
testSchema.plugin(toJSON);

module.exports = mongoose.model("Test", testSchema);

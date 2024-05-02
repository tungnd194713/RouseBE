const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const { decode } = require("html-entities");

const Schema = mongoose.Schema;

const testSchema = new Schema(
  {
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    time: Number,
    name: String,
    grade: { type: Number },
    note: {
      type: String,
      get: decode,
    },
    isShuffled: {
      type: Boolean,
      default: true,
    },
    isSorted: {
      type: Boolean,
      default: true,
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

testSchema.plugin(paginate);
testSchema.plugin(toJSON);

module.exports = mongoose.model("Test", testSchema);

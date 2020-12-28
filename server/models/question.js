var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var QuestionSchema = new Schema({
    qType: {
        type: String,
        enum : ['multi','match']
    },
    score: Number,
    time: Number,
    qContent: String,
    qAnswer: Array
});

var Question = mongoose.model("Question", QuestionSchema);
module.exports = Question;

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var StudentSchema = new Schema({
    name: String,
    score: {
        type: Number,
        default: 0
    }
});

var Student = mongoose.model("Student", StudentSchema);
module.exports = Student;

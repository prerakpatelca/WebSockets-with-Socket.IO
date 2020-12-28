// "StAuth10065: I Vivek Patel, 000331374 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else."

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

const mongodb_conn_module = require('./src/mongodbConnModule');
var db = mongodb_conn_module.connect();

var Question = require("./models/question");
var Student = require("./models/student");

app.get('/get_student/:id', (req, res) => {
    Student.findOne({ _id: req.params.id }, function (error, student) {
        if (error) { console.error(error); }
        res.send({
            student: student
        })
    }).sort({ _id: -1 })
})

app.get('/get_all_students', (req, res) => {
    Student.find({}, function (error, students) {
        if (error) { console.error(error); }
        res.send({
            students: students
        })
    }).sort({ score: -1 })
})

app.post('/add_question', (req, res) => {
    var new_question = new Question(req.body)

    new_question.save(function (error) {
        if (error) {
            console.log(error)
        }

        res.json(new_question)
    })
})

app.get('/get_question_by_id/:id', (req, res) => {
    Question.findById(req.params.id, function (err, question) {
        if (err) {
            console.log(err)
        }
        res.json(question);
    })
})

app.post('/add_student', (req, res) => {
    var new_student = new Student(req.body)

    new_student.save(function (error) {
        if (error) {
            console.log(error)
        }

        res.json(new_student)
    })
})

app.put('/edit_student/:id', (req, res) => {
    var id = req.body.id
    var score = req.body.score
    var savedScore = 0

    Student.findById(id, function (err, student) {
        if (err) {
            console.log(err)
        }
        student.score += score
        savedScore = student.score
        student.save(function (error) {
            if (error) {
                console.log(error)
            }
            res.json({ score: savedScore })
        })
    })
})

app.listen(process.env.PORT || 8081)

const server = require("http").createServer(app);
const io = require("socket.io").listen(server);

io.on("connection", socket => {
    // addQuestion
    socket.on("addQuestion", id => {
        io.emit("newQuestion", id)
    });

    socket.on("submitAnswer", data => {
        io.emit("showAnswers", data)
    });
});

server.listen(4000, () => console.log("server running on port" + 4000));


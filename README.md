# WebSockets-with-Socket.IO
Created a website similar to Kahoot where teacher can create a question and can send it to students, which then later students can answer it in time limit specified

Created a real-time web application that allows teachers to create timed questions, send those questions to students who must answer them in time, collects and displays the answer results, and then repeat this process for additional questions.

Created a file named server.js to handle WebSocket connections and messages from both the teacher and students. Assuming that a single teacher accesses the application using the URL http://localhost:3000/teacher, and assumeing that any number of students access the application using the URL http://localhost:3000/student.
Used socket.io to implement both the server and client.

# Languages and Tools used
    - VueJS
    - NodeJS
    - Socket.io
    - jQuery
 
 # Learning Objectives
    - Create a real-time web application with Socket.io
    - Use WebSockets to co-ordinate interaction between different users

# Instructions to run the file

There are two folders one for the client side and other for the server side

	- Client side handles everything on the frontend using Vue.js and server side handles everything on the server side using socket.io
	- To start the project you need two terminals 
	- In first terminal point it to the client and give the command “npm start”
	- In second terminal point it to the server and give the command “node server”
	- I have also used. Mongodb in my project to take this project to one step further, to store the data of the students participating in the Quiz game


To install Mongodb on your Mac we have to write following code in the terminal

We will need Homebrew top begin with so to install HomeBrew write this in your terminal
- /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

And if you have already home brew use following code to update
- brew update

Now let's install Mongodb
- brew tap mongodb/brew
- brew install mongodb-community

And now let's start the Mongodb Server
- brew services run mongodb-community

And finally we will need Mongodb for the project so
- npm install mongodb


Now if you try to run "node server" while pointing to the server folder it will run just fine with no error whatsoever. And if there is any error installing Mongodb you might have to add "sudo" before the code, but as far as I know it will not require.

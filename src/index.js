//this file is the start point and also contains SERVER SIDE SOCKET CPROGRAMMING

const express = require('express')

const app = new express()
app.use(express.json())
const port = process.env.PORT ||3000
const filter =require('bad-words')      //for filterning and ack implementaion
const {addUser, removeUser, getUser, getUsersInRoom_array} =require('./utils/users')      //users ko save karna ka functionality

const path = require('path')
const publicDirectorypath = path.join(__dirname,'../public')     //used to get all the css and js for front end
const {generate_message_toemitby_server} = require('./utils/messages')
app.use(express.static(publicDirectorypath))            //css, js available at publicDirectoryPATH


//****socket server side programming */
const http = require('http')
const server = http.createServer(app)       //create a server that uses http protocol and put app in it

const socketio = require('socket.io')
const io =socketio(server)                  //socketio requires some server to fucntion 

let count = 0
//listen to the client
io.on("connection",(socket)=>{
    console.log("New Connection")
   
    

    //for listening to join event 
    socket.on('join', ({username , room}, callback)=>{

        //save user
        const{error, user} = addUser({ id:socket.id, username, room})             //id comes on socket.id and is a parent fucntion parameter , so can be used throught in io fucntion
        if(error){
            return callback(error)               //idhar bi callback use kiya hai and ack is used in chat.js ka lastest line 
        }

        socket.join(user.room)

        //io.to.emit, socket.broadcast.to.emit    //they emit messages to specific chat room


        
        //situation -2 (have a server sendinf msg to new clients)
        socket.emit('welcome_msg', generate_message_toemitby_server('admin', 'Welcome !'))
        socket.broadcast.to(user.room).emit('welcome_msg', generate_message_toemitby_server('admin',`${user.username} has joined!`))
        //testing
        /*socket.emit('event_name',count ) */              //server sedning event to client(chat.js)


        //displaying room and user info in the left side bar
        io.to(user.room).emit('roomData',{                     //abhi naya .on creatre hoga in chat.js with the name roomData
            'room' :user.room,
            'users_in_room' : getUsersInRoom_array(user.room)
        })


        callback()                  //if this is called means ,user was able to join without any error
                                    //impacting use nahi hai yeh linkhne ka as of now
    })


    //callback maane ack is implemented
    socket.on('send_location', ( msg,  callback)=>{
        console.log(msg)
        const user = getUser(socket.id)
                               
        const f = new filter()                   // new instance
        if(f.isProfane(msg)){
            return callback(msg+ " is not allowed to speak")   //if bad word detected toh callback mein ack dedo and return stops the execution
        }

        io.to(user.room).emit('welcome_msg', generate_message_toemitby_server(user.username,msg) )            //updated count sent back to client
                                                //socket is used to send data to one client
                                                //io is used to send data to all clients.
        callback()                               //if everything is proper dont privide anything in ack
    })
    
    
    
    socket.on('send_client_location', (coords, callback)=>{                                //server recieves current client locayion

        const user = getUser(socket.id)
       
        if(coords.latitude && coords.longitude)
        {
        
        //io.emit('current_location_msg', `Location: ${coords.latitude}, ${coords.longitude}`)  //then sends it to all 
        io.to(user.room).emit('current_location_msg', generate_message_toemitby_server(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`)) 
        callback()
        }
        else{
            callback("Location not recieved")
        }
    })


    socket.on('disconnect', ()=>{

        const user = removeUser(socket.id)
        if(user){
            console.log(`${user.username} has left`)
            io.to(user.room).emit('welcome_msg', generate_message_toemitby_server('admin',`${user.username} user has left`))


             //displaying room and user info in the left side bar (yahan pe bi , as if user get disconnected to list refresh honi chaiye)
            io.to(user.room).emit('roomData',{                     //abhi naya .on creatre hoga in chat.js with the name roomData
            'room' :user.room,
            'users_in_room' : getUsersInRoom_array(user.room)
            })
        }

       
        
    
    })

})



server.listen(port, ()=>{                              //as listen() is asynchronous, hence callback
    console.log("Server is up on port: "+ port)
})

//no use , we have own server
/*app.listen(port, ()=>{                              //as listen() is asynchronous, hence callback
    console.log("Server is up on port: "+ port)
})*/''
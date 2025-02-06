const express = require('express');
const app = express();
const port = 8000;
require('dotenv').config();
const session = require('express-session');
const mongoDB = require('./db');
const passport = require('passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const AllNotifications=require('./models/AllNotifications');
const { v4: uuidv4 } = require('uuid');


const passportgoogle = require('./config/google-oAuth2-stratigity')
mongoDB();

app.use(cors({
  origin: process.env.FRONT_URL,
  credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));
app.set('view engine', 'ejs');
app.use(session({
  name: 'indiagramcookie',
  secret: 'abcdefghijklmnopqrstuvwxyz',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use('/', require('./Routes'));


const server = app.listen(port, () => {
  console.log(`Your server is started and running on prot no ${port}`);
})


var user=[];

const addUser = (name, id) => {
  const foundIndex = user.findIndex(user => user.name === name);
  if (foundIndex === -1) {
    user.push({ name: name, id: id });
  } else {
   user[foundIndex].id = id;
  }

};

const delUser = (id)=>{
  user=user.filter((item) => item.id !=id);

}

const socketIO = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONT_URL
  }
});

const handleOffileUser=async (data)=>{
  let obj={
   sender:data.senderUserId,
   msg:"has requested to follow you",
   type:"follow",
   id:uuidv4()
  }
  let user = await AllNotifications.findOne({email:data.receiverUserId});
    if(user){          
      await AllNotifications.findOneAndUpdate({email:data.receiverUserId},{$push :{ NotificationArray:obj}})
      }
  else{
     await AllNotifications.create({
      email:data.receiverUserId,
      NotificationArray:obj
     })
  }
}


socketIO.on('connection', (socket) => {


  socket.on('newUser', (data) =>{
    addUser(data.name, socket.id)   
  })

  socket.on('follow', (data) => {
    const foundElement = user.find(item => item.name === data.receiverUserId);
    if(foundElement!=undefined){
    socket.to(foundElement.id).emit('followRequest', {
      senderUserId: data.senderUserId,
      msg:"has requested to follow you"
    })
    handleOffileUser(data);
  }
  else{    
    handleOffileUser(data);
  }
  });
  socket.on('msg', (data)=>{
  })

  socket.on('disconnect', () => {
    delUser(socket.id)   
  });
});

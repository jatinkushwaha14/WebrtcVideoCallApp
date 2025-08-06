const { Server } = require("socket.io");

const io = new Server(3000, {
  cors: true,
});


const emailtosocketidmap = new Map();
const socketidtoemailmap = new Map();

io.on("connection", (socket) => {
  socket.on('joinLobby', (data) => {
    const { email, room } = data; 
    if (email && room) {
      emailtosocketidmap.set(email, socket.id); 
      socketidtoemailmap.set(socket.id, email);
      socket.emit('joinLobby', data);  

      
      socket.join(room);
      io.to(room).emit('userJoined', {
        email: email,
        id: socket.id,
      });

    } else {
      socket.emit('error', 'Please provide both email and room ID');
    }
  });
  socket.on('callUser', (data) => {
    const { offer, to } = data;
    console.log("Server received callUser for:", to);
    io.to(to).emit('incomingcall', {
      offer: offer,
      from: socket.id,
    });
  });  
  socket.on('callaccepted', (data) => {
    const { answer, to } = data;
    console.log("Server received callaccepted for:", to);
    io.to(to).emit('callaccepted', {
      answer: answer,
      from: socket.id,
    });
  });
  socket.on('negoneeded', (data) => {
    const { offer, to } = data;
    console.log("Server received negoneeded for:", to);
    io.to(to).emit('negoneeded', {
      offer: offer,
      from: socket.id,
    });
  });
  socket.on('negodone', (data) => {
    const { answer, to } = data;
    console.log("Server received negodone for:", to);
    io.to(to).emit('negofinal', {
      answer: answer,
      from: socket.id,
    });
  });
});
import './lobby.css'
import { useState,  useCallback, useEffect, use } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/socketprovider';



function Lobby() {
    const [email, setEmail] = useState('');
    const [room, setRoom] = useState('');
    const socket = useSocket();
    const navigate = useNavigate(); 
    const handlesubmit = useCallback((e) => {
        e.preventDefault();
        if (email && room) {
            socket.emit('joinLobby', { email, room });
        } else {
            alert('Please fill in both fields');
        } 
    }, [email, room, socket]);

    const handlejoinLobby = useCallback((data) => {
        const { room } = data;
        navigate(`/room/${room}`);
    }, [navigate]);

    useEffect(() => {
        socket.on('joinLobby', handlejoinLobby);
        return () => {
            socket.off('joinLobby', handlejoinLobby);   
        }
    }
    , [socket]);
    return (
    <>
        <div>
        <h1>Welcome to the Lobby</h1>
        <form onSubmit={handlesubmit}>
            <label htmlFor="email">Enter your email</label>
            <input type="email" id="email" name="email" required value={email} onChange={(e)=>setEmail(e.target.value)}/>
            <label htmlFor="room">Enter a room ID</label>
            <input type="text" id="room" name="room" required value={room} onChange={(e)=>setRoom(e.target.value)}/>
            <button type="submit">Join Lobby</button>
        </form>
        </div>
    </>
    )
} 

export default Lobby;

import { useEffect, useCallback, useState, useRef } from 'react';  
import { useSocket } from '../context/socketprovider';
import ReactPlayer from 'react-player';
import './room.css';
import { peer } from '../service/peer';

export const Roompage = () => {
    const socket = useSocket();
    const [socketId, setsocketId] = useState(null);
    const [myStream, setMyStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    const tracksAdded = useRef(false);

    // Get user media ONCE when component mounts
    useEffect(() => {
        (async () => {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setMyStream(stream);
        })();
    }, []);

    // Add tracks ONCE after myStream is set
    useEffect(() => {
        if (myStream && !tracksAdded.current) {
            myStream.getTracks().forEach(track => {
                peer.peer.addTrack(track, myStream);
            });
            tracksAdded.current = true;
        }
    }, [myStream]);

    const handlejoinLobby = useCallback((data) => {
        if (data.id !== socket.id) {
            setsocketId(data.id);
            console.log("User joined the lobby", data.id);
        }
    }, [socket]);

    const handlecalluser = useCallback(async () => {
        if (!myStream) return; // Wait for stream
        const offer = await peer.getOffer();
        console.log("Emitting callUser to:", socketId);
        socket.emit('callUser', {
            offer: offer,
            to: socketId
        });
    }, [socketId, socket, myStream]);

    const handleincomingcall = useCallback(async (data) => {
        const { offer, from } = data;
        console.log("Incoming call from", from);
        setsocketId(from);
        if (!myStream) return; // Wait for stream
        await peer.setRemoteDescription(offer);
        const answer = await peer.getAnswer();
        socket.emit('callaccepted', {
            answer: answer,
            to: from
        });
    }, [socket, myStream]);

    const handlecallaccpeted = useCallback(async (data) => {
        const { answer, from } = data;
        console.log("Call accepted from", from);
        await peer.setRemoteDescription(answer);
    }, []);

    const handlenegoneeded = useCallback(async () => {
        const offer = await peer.getOffer();
        socket.emit('negoneeded', { offer, to: socketId });
    }, [socketId, socket]);

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handlenegoneeded);
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handlenegoneeded);
        };
    }, [handlenegoneeded]);

    useEffect(() => {
        const onTrack = (event) => {
            const remoteStream = event.streams[0];
            console.log("GOT TRACKS");
            setRemoteStream(remoteStream);
        };
        peer.peer.addEventListener('track', onTrack);
        return () => {
            peer.peer.removeEventListener('track', onTrack);
        };
    }, []);

    const handlenegoincoming = useCallback(async (data) => {
        const { offer, from } = data;
        console.log("Negotiation needed from", from);
        await peer.setRemoteDescription(offer);
        const answer = await peer.getAnswer();
        socket.emit('negodone', {
            answer: answer,
            to: from
        });
    }, [socket]);

    const handlenegofinal = useCallback(async (data) => {
        const { answer, from } = data;
        console.log("Negotiation final from", from);
        await peer.setRemoteDescription(answer);
    }, []);

    useEffect(() => {
        socket.on('userJoined', handlejoinLobby);
        socket.on('incomingcall', handleincomingcall);
        socket.on('callaccepted', handlecallaccpeted);
        socket.on('negoneeded', handlenegoincoming);
        socket.on('negofinal', handlenegofinal);
        return () => {
            socket.off('userJoined', handlejoinLobby);
            socket.off('incomingcall', handleincomingcall);
            socket.off('callaccepted', handlecallaccpeted);
            socket.off('negoneeded', handlenegoincoming);
            socket.off('negofinal', handlenegofinal);
        };
    }, [socket, handlejoinLobby, handleincomingcall, handlecallaccpeted, handlenegoincoming, handlenegofinal]);

    useEffect(() => {
        return () => {
            if (myStream) {
                myStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [myStream]);

    return (
        <div className="room-container">
            <h1>Room Page</h1>
            <p className="status-text">{socketId ? "Connected" : "No one in the room"}</p>
            {socketId && !remoteStream && <button onClick={handlecalluser}>Call</button>}
            <div className="video-area">
                {myStream && (
                <div className="video-card">
                    <ReactPlayer
                    playing
                    muted
                    height="100%"
                    width="100%"
                    style={{ transform: "scaleX(-1)" }}
                    url={myStream}
                    className="react-player"
                    />
                    <span className="video-label">My Stream</span>
                </div>
                )}
                {remoteStream && (
                <div className="video-card">
                    <ReactPlayer
                    playing
                    muted
                    height="100%"
                    width="100%"
                    style={{ transform: "scaleX(-1)" }}
                    url={remoteStream}
                    className="react-player"
                    />
                    <span className="video-label">Remote Stream</span>
                </div>
                )}
            </div>
            </div>
    );
}
import { createContext, useMemo, useContext} from "react";
import {io} from "socket.io-client";


const SocketContext = createContext(null);

export const useSocket = ()=>{
    const socket = useContext(SocketContext);
    if (!socket) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return socket;
}

export const SocketProvider = (props)=>{
    const socket = useMemo(() => io(import.meta.env.VITE_BACKEND_URL), []);
    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    );
}


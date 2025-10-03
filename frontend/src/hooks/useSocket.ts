import { useEffect, useState } from 'react';
import { socketService } from '../services/socket.service';

export const useSocket = () => {
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        socketService.connect();

        const handleConnect = () => setIsConnected(true);
        const handleDisconnect = () => setIsConnected(false);

        socketService.on('connect', handleConnect);
        socketService.on('disconnect', handleDisconnect);

        return () => {
            socketService.off('connect', handleConnect);
            socketService.off('disconnect', handleDisconnect);
        };
    }, []);

    return {
        isConnected,
        socket: socketService,
    };
};
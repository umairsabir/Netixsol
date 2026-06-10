import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL as string, {
      withCredentials: true,
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const joinCar = (carId: string) => {
    socketRef.current?.emit('joinCar', carId);
  };

  const leaveCar = (carId: string) => {
    socketRef.current?.emit('leaveCar', carId);
  };

  return {
    socket: socketRef.current,
    joinCar,
    leaveCar,
  };
};

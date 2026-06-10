"use client";
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setWishlist } from '@/store/slices/wishlistSlice';
import { addNotification, setNotifications } from '@/store/slices/notificationSlice';
import api from '@/lib/axios';

interface SocketContextType {
    socket: Socket | null;
    joinCar: (carId: string) => void;
    leaveCar: (carId: string) => void;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);

    const isAuthPage = pathname === '/login' || pathname === '/register';

    useEffect(() => {
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';
        const socket = io(socketUrl, {
            withCredentials: true,
            transports: ['websocket', 'polling'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            console.log('Connected to socket server');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            console.log('Disconnected from socket server');
        });

        // Global Listeners for Notifications
        socket.on('newAuction', (car) => {
            dispatch(addNotification({
                _id: Math.random().toString(36).substr(2, 9),
                title: 'New Auction Live!',
                message: `${car.title} is now open for bidding.`,
                type: 'info',
                isRead: false,
                link: `/car/${car.id}`,
                createdAt: new Date().toISOString()
            }));
            toast((t) => (
                <div className="flex items-center gap-4 min-w-[280px]">
                    {car.image && (
                        <div className="w-16 h-12 relative rounded overflow-hidden shrink-0">
                            <Image src={car.image} alt={car.title} fill className="object-cover" />
                        </div>
                    )}
                    <div className="flex flex-col flex-1">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">New Auction Live!</p>
                        <p className="text-sm font-bold text-[#2E3D83] line-clamp-1">{car.title}</p>
                        <Link 
                            href={`/car/${car.id}`}
                            onClick={() => toast.dismiss(t.id)}
                            className="text-[10px] font-black text-[#2E3D83] underline mt-1"
                        >
                            VIEW LISTING
                        </Link>
                    </div>
                </div>
            ), { duration: 8000, position: 'top-right' });
        });

        socket.on('globalBid', (bid) => {
            dispatch(addNotification({
                _id: Math.random().toString(36).substr(2, 9),
                title: 'New Price Alert 💰',
                message: `${bid.userName} bid $${bid.amount.toLocaleString()} on ${bid.carTitle}`,
                type: 'info',
                isRead: false,
                link: `/car/${bid.carId}`,
                createdAt: new Date().toISOString()
            }));
            toast((t) => (
                <div className="flex flex-col gap-3 min-w-[280px]">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-[#2E3D83] rounded-full flex items-center justify-center text-white font-bold shrink-0">
                            {bid.userName?.[0] || 'U'}
                        </div>
                        <div className="flex flex-col">
                            <p className="text-sm font-medium text-gray-900">
                                <Link 
                                    href={`/user/${bid.userId}`} 
                                    onClick={() => toast.dismiss(t.id)}
                                    className="font-bold text-[#2E3D83] hover:underline"
                                >
                                    {bid.userName}
                                </Link> placed a bid on
                            </p>
                            <p className="text-sm font-bold text-[#2E3D83]">{bid.carTitle}</p>
                            <p className="text-lg font-black text-[#F4C23D] mt-1">${bid.amount.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 border-t border-gray-100 pt-3">
                        <Link 
                            href={`/car/${bid.carId}`} 
                            onClick={() => toast.dismiss(t.id)}
                            className="flex-1 text-center py-2 bg-[#2E3D83] text-white text-[10px] font-bold uppercase tracking-wider rounded-[5px]"
                        >
                            View Auction
                        </Link>
                    </div>
                </div>
            ), { duration: 6000, position: 'bottom-right' });
        });

        socket.on('auctionWinner', (bid) => {
            dispatch(addNotification({
                _id: Math.random().toString(36).substr(2, 9),
                title: 'Auction Result! 🏆',
                message: `${bid.userName} won the ${bid.carTitle} for $${bid.amount.toLocaleString()}`,
                type: 'success',
                isRead: false,
                link: `/car/${bid.carId}`,
                createdAt: new Date().toISOString()
            }));
            toast((t) => (
                <div className="flex flex-col gap-4 min-w-[320px] bg-[#F9C146]/5 p-2">
                    <div className="text-center">
                        <span className="text-3xl">🏆</span>
                        <h3 className="text-xl font-black text-[#2E3D83] uppercase tracking-tighter mt-2">Auction Winner!</h3>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-center text-sm font-medium text-[#2E3D83]">
                            <Link 
                                href={`/user/${bid.userId}`} 
                                onClick={() => toast.dismiss(t.id)}
                                className="font-black underline"
                            >
                                {bid.userName}
                            </Link> won the
                        </p>
                        <p className="text-lg font-black text-[#2E3D83] text-center">{bid.carTitle}</p>
                        <p className="text-3xl font-black text-[#2E3D83]">${bid.amount.toLocaleString()}</p>
                    </div>
                    <Link 
                        href={`/car/${bid.carId}`} 
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full text-center py-3 bg-[#2E3D83] text-white text-[12px] font-bold uppercase tracking-[2px] rounded-[5px]"
                    >
                        See Results
                    </Link>
                </div>
            ), { duration: 10000, position: 'top-center' });
        });

        socket.on('auctionClosed', (car) => {
            toast.error(`🔒 Auction Closed: ${car.title}`, {
                duration: 5000,
                position: 'top-right',
            });
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    // Initial Sync (Wishlist & Notifications)
    useEffect(() => {
        const syncData = async () => {
            if (user && !isAuthPage) {
                try {
                    // Sync Wishlist
                    const { data: wishlistData } = await api.get('/wishlist');
                    const carIds = wishlistData.map((item: any) => item.car._id);
                    dispatch(setWishlist(carIds));

                    // Sync Notifications (Wait until backend is ready)
                    try {
                        const { data: notificationData } = await api.get('/notifications');
                        dispatch(setNotifications(notificationData));
                    } catch (err) {
                        console.warn('Failed to sync notifications (Backend might not be ready yet)');
                    }
                } catch (err: any) {
                    if (err.response?.status !== 401) {
                        console.error('Failed to sync data:', err);
                    }
                }
            } else if (!user) {
                dispatch(setWishlist([]));
                dispatch(setNotifications([]));
            }
        };
        syncData();
    }, [user, dispatch, isAuthPage]);

    const joinCar = (carId: string) => {
        socketRef.current?.emit('joinCar', carId);
    };

    const leaveCar = (carId: string) => {
        socketRef.current?.emit('leaveCar', carId);
    };

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, joinCar, leaveCar, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocketContext must be used within a SocketProvider');
    }
    return context;
};

"use client";
import { useState, useEffect } from "react";

export interface CountdownTime {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
}

const calculateTimeLeft = (targetDate: string | Date): CountdownTime => {
    const total = Date.parse(targetDate.toString()) - Date.now();
    
    if (total <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { days, hours, minutes, seconds, isExpired: false };
};

export const useCountdown = (targetDate: string | Date | undefined | null) => {
    const [timeLeft, setTimeLeft] = useState<CountdownTime>(() => 
        targetDate ? calculateTimeLeft(targetDate) : { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true }
    );

    useEffect(() => {
        if (!targetDate) return;

        // Update every 30 seconds for performance, or use 1s if seconds are displayed
        const interval = setInterval(() => {
            const time = calculateTimeLeft(targetDate);
            setTimeLeft(time);
            if (time.isExpired) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [targetDate]);

    return timeLeft;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchPrayerTimes, getNextPrayer, PrayerTimes } from '@/lib/prayer-times';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/_core/hooks/useAuth';
import { toast } from 'sonner';

interface PrayerTimesContextType {
    times: PrayerTimes | null;
    nextPrayer: { name: string; time: string; remaining: string } | null;
    preferences: any | null;
    date: {
        hijri: {
            month: { ar: string, number: number };
            year: string;
            day: string;
        };
        gregorian: {
            date: string;
            format: string;
            day: string;
            month: { number: number; en: string };
            year: string;
        };
    } | null;
    loading: boolean;
}

const PrayerTimesContext = createContext<PrayerTimesContextType | undefined>(undefined);

export const PrayerTimesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [times, setTimes] = useState<PrayerTimes | null>(null);
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string; remaining: string } | null>(null);
    const [dateInfo, setDateInfo] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [preferences, setPreferences] = useState<any>(null);

    // 1. Load preferences
    useEffect(() => {
        async function loadPrefs() {
            if (user?.id) {
                const { data } = await supabase
                    .from('user_preferences')
                    .select('*')
                    .eq('user_id', user.id)
                    .single();

                if (data) {
                    setPreferences(data);
                    return;
                }
            }
            
            // Default preferences for guests or if not set
            setPreferences({
                city: 'Baghdad',
                country: 'Iraq',
                calculation_method: 3,
                notifications_enabled: true,
                athan_enabled: false,
                athan_voice: 'makkah',
                pre_notification_enabled: false,
                pre_notification_time: 5
            });
        }
        loadPrefs();
    }, [user]);

    // 2. Fetch prayer times
    useEffect(() => {
        if (!preferences?.country || !preferences?.city) return;

        async function updateTimes() {
            setLoading(true);
            const data = await fetchPrayerTimes(preferences.city, preferences.country, preferences.calculation_method);
            if (data) {
                setTimes(data.timings);
                setDateInfo(data.date);
                const next = getNextPrayer(data.timings);
                setNextPrayer(next);
            }
            setLoading(false);
        }
        updateTimes();
    }, [preferences]);

    // 3. Scheduling & Background logic
    useEffect(() => {
        if (!times || !preferences) return;

        const interval = setInterval(() => {
            const now = new Date();
            const currentTimeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

            // Re-calculate next prayer every minute to keep "remaining" up to date
            const next = getNextPrayer(times);
            setNextPrayer(next);

            // Check for exact prayer time (Adhan)
            const entries = Object.entries(times);
            for (const [name, time] of entries) {
                if (time === currentTimeStr) {
                    handleAthanTrigger(name);
                }

                if (preferences.pre_notification_enabled) {
                    const [h, m] = time.split(':').map(Number);
                    const prayerDate = new Date();
                    prayerDate.setHours(h, m, 0, 0);
                    const preTimeMinutes = preferences.pre_notification_time || 5;
                    const preNotificationDate = new Date(prayerDate.getTime() - preTimeMinutes * 60 * 1000);

                    if (preNotificationDate.getHours() === now.getHours() && preNotificationDate.getMinutes() === now.getMinutes()) {
                        sendNotification(`اقترب وقت صلاة ${translate(name)}`, `بقي ${preTimeMinutes} دقائق على الأذان`);
                    }
                }
            }
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [times, preferences]);

    const handleAthanTrigger = (name: string) => {
        if (preferences.notifications_enabled) {
            sendNotification(`حان الآن وقت صلاة ${translate(name)}`, "حي على الصلاة، حي على الفلاح");
        }

        if (preferences.athan_enabled) {
            playAthan();
        }
    };

    const sendNotification = (title: string, body: string) => {
        if (Notification.permission === "granted") {
            new Notification(title, { body, icon: "/favicon.ico" });
        } else {
            toast.info(title, { description: body });
        }
    };

    const playAthan = () => {
        const voices: Record<string, string> = {
            makkah: "https://www.islamcan.com/audio/adhan/azan1.mp3",
            madinah: "https://www.islamcan.com/audio/adhan/azan3.mp3",
            aqsa: "https://www.islamcan.com/audio/adhan/azan10.mp3",
            egypt: "https://www.islamcan.com/audio/adhan/azan2.mp3",
            turkey: "https://www.islamcan.com/audio/adhan/azan21.mp3",
            shia: "https://www.salahtimes.com/audio/adhan/shia/1.mp3"
        };

        const voiceUrl = voices[preferences?.athan_voice] || voices.makkah;
        const audio = new Audio(voiceUrl);
        audio.play().catch(e => console.warn("Auto-play blocked by browser. User interaction required."));
    };

    const translate = (name: string) => {
        const ar: any = { Fajr: "الفجر", Dhuhr: "الظهر", Asr: "العصر", Maghrib: "المغرب", Isha: "العشاء" };
        return ar[name] || name;
    };

    return (
        <PrayerTimesContext.Provider value={{ times, nextPrayer, preferences, date: dateInfo, loading }}>
            {children}
        </PrayerTimesContext.Provider>
    );
};

export const usePrayerTimes = () => {
    const context = useContext(PrayerTimesContext);
    if (context === undefined) {
        throw new Error('usePrayerTimes must be used within a PrayerTimesProvider');
    }
    return context;
};

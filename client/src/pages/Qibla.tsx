import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Smartphone, RotateCcw, Camera, LayoutGrid, Zap, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { AuthReminder } from "@/components/AuthReminder";

export default function Qibla() {
    const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
    const [qiblaDir, setQiblaDir] = useState<number | null>(null);
    const [heading, setHeading] = useState<number>(0);
    const [permissionGranted, setPermissionGranted] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [loading, setLoading] = useState(false);
    const [arMode, setArMode] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        const iOS = typeof (DeviceOrientationEvent as any)?.requestPermission === 'function';
        setIsIOS(iOS);
        if (!iOS) setPermissionGranted(true);

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const toggleAR = async () => {
        if (!arMode) {
            try {
                const newStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" }
                });
                setStream(newStream);
                if (videoRef.current) videoRef.current.srcObject = newStream;
                setArMode(true);
                toast.success("تم تفعيل وضع الواقع المعزز");
            } catch (err) {
                toast.error("تعذر الوصول للكاميرا");
            }
        } else {
            if (stream) stream.getTracks().forEach(track => track.stop());
            setArMode(false);
        }
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            toast.error("المتصفح لا يدعم تحديد الموقع");
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const { latitude, longitude } = pos.coords;
                setCoords({ lat: latitude, lon: longitude });
                try {
                    const response = await fetch(`https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`);
                    const data = await response.json();
                    if (data.code === 200) setQiblaDir(data.data.direction);
                } catch (error) {
                    const kaabaLat = 21.4225, kaabaLon = 39.8262;
                    const toRad = (d: number) => d * Math.PI / 180;
                    const toDeg = (r: number) => r * 180 / Math.PI;
                    const y = Math.sin(toRad(kaabaLon - longitude));
                    const x = Math.cos(toRad(latitude)) * Math.tan(toRad(kaabaLat)) -
                        Math.sin(toRad(latitude)) * Math.cos(toRad(kaabaLon - longitude));
                    setQiblaDir((toDeg(Math.atan2(y, x)) + 360) % 360);
                } finally { setLoading(false); }
            },
            (err) => { setLoading(false); toast.error("فشل الحصول على الموقع"); }
        );
    };

    useEffect(() => {
        if (!permissionGranted) return;
        const handleOrientation = (e: DeviceOrientationEvent | any) => {
            let h = (e as any).webkitCompassHeading || (360 - e.alpha);
            setHeading(h);
        };
        const eventName = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
        window.addEventListener(eventName as any, handleOrientation, true);
        return () => window.removeEventListener(eventName as any, handleOrientation);
    }, [permissionGranted]);

    const diff = qiblaDir !== null ? (qiblaDir - heading + 360) % 360 : 0;
    const isAligned = diff < 5 || diff > 355;

    return (
        <div className={`min-h-screen transition-colors duration-1000 ${arMode ? 'bg-black' : 'bg-slate-50 dark:bg-slate-950'}`}>
            {arMode && (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
            )}

            <div className="container mx-auto p-4 max-w-2xl space-y-6 relative z-10">
                <header className={`text-center space-y-2 pt-8 ${arMode ? 'text-white' : ''}`}>
                    <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                        بوصلة القبلة AR
                    </h1>
                    <p className="opacity-70">تقنية الواقع المعزز لتحديد دقيق للقبلة</p>
                </header>

                <AuthReminder message="سجل دخولك لحفظ مواقعك المفضلة ومزامنة بياناتك عبر أجهزتك" />

                <div className="flex justify-center gap-4">
                    <Button
                        onClick={() => setArMode(false)}
                        variant={!arMode ? "default" : "secondary"}
                        className="rounded-full px-6"
                    >
                        <LayoutGrid className="ml-2 w-4 h-4" />
                        الوضع العادي
                    </Button>
                    <Button
                        onClick={toggleAR}
                        variant={arMode ? "default" : "secondary"}
                        className="rounded-full px-6 bg-emerald-600 hover:bg-emerald-500"
                    >
                        <Camera className="ml-2 w-4 h-4" />
                        الواقع المعزز (AR)
                    </Button>
                </div>

                <Card className={`p-8 flex flex-col items-center relative overflow-hidden border-none shadow-2xl ${arMode ? 'bg-black/40 backdrop-blur-xl border border-white/10' : 'bg-white/80 dark:bg-slate-900/80'
                    }`}>
                    <AnimatePresence mode="wait">
                        {!coords ? (
                            <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="text-center py-20 space-y-6"
                            >
                                <SignalIcon className={`w-20 h-20 mx-auto ${arMode ? 'text-emerald-400' : 'text-primary'} animate-pulse`} />
                                <h3 className={`text-2xl font-bold ${arMode ? 'text-white' : ''}`}>بانتظار الإشارة...</h3>
                                <Button onClick={getLocation} size="lg" className="rounded-2xl px-12" disabled={loading}>
                                    {loading ? "جاري التحديد..." : "ابدأ التحديد"}
                                </Button>
                            </motion.div>
                        ) : (
                            <div className="w-full flex flex-col items-center gap-12">
                                <div className={`relative w-72 h-72 md:w-80 md:h-80 ${isAligned ? 'scale-110' : ''} transition-all duration-500`}>
                                    {/* Aligned Glow */}
                                    <AnimatePresence>
                                        {isAligned && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1.2 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 bg-emerald-500/30 rounded-full blur-3xl"
                                            />
                                        )}
                                    </AnimatePresence>

                                    {/* Outer Ring */}
                                    <div className={`absolute inset-0 border-4 rounded-full transition-colors duration-500 ${isAligned ? 'border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.5)]' : 'border-slate-200 dark:border-slate-800'
                                        }`} />

                                    {/* Compass Rotation */}
                                    <div
                                        className="absolute inset-0 transition-transform duration-150 ease-out"
                                        style={{ transform: `rotate(${-heading}deg)` }}
                                    >
                                        {/* North Point */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-600 rounded-full shadow-lg" />

                                        {/* Qibla Point */}
                                        {qiblaDir !== null && (
                                            <div
                                                className="absolute inset-0"
                                                style={{ transform: `rotate(${qiblaDir}deg)` }}
                                            >
                                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 flex flex-col items-center">
                                                    <div className={`w-16 h-16 bg-zinc-950 rounded-2xl border-2 flex items-center justify-center shadow-2xl transition-all ${isAligned ? 'border-emerald-400 scale-125' : 'border-yellow-600'
                                                        }`}>
                                                        <KaabaIcon className={`w-10 h-10 ${isAligned ? 'text-emerald-400' : 'text-yellow-500'}`} />
                                                    </div>
                                                    <div className={`w-1 h-32 bg-gradient-to-b from-yellow-500 to-transparent mt-2 ${isAligned ? 'from-emerald-500' : ''}`} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Center Dot */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className={`w-4 h-4 rounded-full shadow-lg ${isAligned ? 'bg-emerald-500' : 'bg-primary'}`} />
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="flex items-center gap-4 px-8 py-4 bg-muted/40 rounded-3xl backdrop-blur-md justify-center">
                                        <div className="space-y-1">
                                            <p className="text-xs opacity-60">درجة الاتجاه</p>
                                            <p className="text-3xl font-black font-mono" dir="ltr">{Math.round(heading)}°</p>
                                        </div>
                                        <div className="w-px h-10 bg-border" />
                                        <div className="space-y-1">
                                            <p className="text-xs opacity-60">زاوية القبلة</p>
                                            <p className="text-3xl font-black font-mono text-emerald-500" dir="ltr">{Math.round(qiblaDir!)}°</p>
                                        </div>
                                    </div>
                                    {isAligned && (
                                        <motion.p
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            className="text-emerald-500 font-bold text-xl mt-6 animate-bounce"
                                        >
                                            أنت تواجه القبلة الآن ✨
                                        </motion.p>
                                    )}
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </Card>

                <Alert className={`${arMode ? 'bg-white/10 text-white border-white/20' : 'bg-blue-50/50'}`}>
                    <Info className="h-4 w-4" />
                    <AlertTitle>معايرة البوصلة</AlertTitle>
                    <AlertDescription>
                        حرك الجهاز على شكل 8 بالهواء لزيادة دقة الحساسات. ابتعد عن الأثاث المعدني والأجهزة الكهربائية.
                    </AlertDescription>
                </Alert>
            </div>
        </div>
    );
}

function SignalIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
            <path d="M12 12v9" />
            <path d="m8 17 4 4 4-4" />
        </svg>
    );
}

function KaabaIcon(props: any) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
        >
            <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />
            <path d="M4 8H20" stroke="gold" strokeWidth="1" />
            <path d="M10 12 L14 12" stroke="gold" strokeWidth="2" />
            <rect x="11" y="14" width="2" height="6" fill="gold" />
        </svg>
    );
}

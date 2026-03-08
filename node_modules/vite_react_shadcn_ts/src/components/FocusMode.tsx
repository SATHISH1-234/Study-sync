import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
    Camera, Play, Pause, RotateCcw, Loader2, AlertCircle,
    CheckCircle2, BookOpen, Layout, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import api from "@/utils/api";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function FocusMode() {
    const { user } = useAuth();
    const [seconds, setSeconds] = useState(25 * 60);
    const [running, setRunning] = useState(false);
    const [courses, setCourses] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [isFaceDetected, setIsFaceDetected] = useState(true);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [loading, setLoading] = useState(false);

    const webcamRef = useRef<Webcam>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const detectionRef = useRef<NodeJS.Timeout | null>(null);

    // Load face-api models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights";
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
                console.log("FaceAPI models loaded from GitHub weights");
            } catch (error) {
                console.error("Error loading face-api models:", error);
                toast.error("Failed to load face detection models. Real-time alerts might be disabled.");
            }
        };
        loadModels();
    }, []);

    // Fetch courses
    useEffect(() => {
        if (user?._id) {
            api.get(`/groups/student/${user._id}`)
                .then(res => setCourses(res.data.data?.map((g: any) => g.courseId).filter(Boolean) || []))
                .catch(err => console.error(err));
        }
    }, [user?._id]);

    // Fetch modules when course changes
    useEffect(() => {
        if (selectedCourse) {
            api.get(`/modules/course/${selectedCourse}`)
                .then(res => setModules(res.data.data || []))
                .catch(err => console.error(err));
        }
    }, [selectedCourse]);

    // Detection loop
    useEffect(() => {
        if (running && modelsLoaded) {
            detectionRef.current = setInterval(async () => {
                if (webcamRef.current && webcamRef.current.video) {
                    const video = webcamRef.current.video;
                    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());

                    if (detections.length === 0) {
                        if (isFaceDetected) {
                            setIsFaceDetected(false);
                            toast.warning("Eyes on the prize! We can't see you.", {
                                description: "Stay in the camera frame to maintain your focus score.",
                                duration: 3000
                            });
                        }
                    } else {
                        setIsFaceDetected(true);
                    }
                }
            }, 3000); // Check every 3 seconds
        } else {
            if (detectionRef.current) clearInterval(detectionRef.current);
            setIsFaceDetected(true);
        }
        return () => {
            if (detectionRef.current) clearInterval(detectionRef.current);
        };
    }, [running, modelsLoaded, isFaceDetected]);

    // Timer loop
    useEffect(() => {
        if (running) {
            timerRef.current = setInterval(() => {
                setSeconds(s => (s > 0 ? s - 1 : 0));
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [running]);

    const handleStart = () => {
        if (!selectedCourse || !selectedModule) {
            toast.error("Please select a course and module first");
            return;
        }
        setRunning(true);
    };

    const handleEndSession = async () => {
        setRunning(false);
        setLoading(true);
        try {
            const duration = Math.floor((25 * 60 - seconds) / 60) || 1;
            await api.post("/sessions", {
                courseId: selectedCourse,
                moduleId: selectedModule,
                duration,
                focusScore: isFaceDetected ? 95 : 60,
                cameraActive: true
            });

            // Also update progress
            await api.post("/progress/update", {
                courseId: selectedCourse,
                moduleId: selectedModule
            });

            toast.success("Focus session recorded!", {
                description: `You focused for ${duration} minutes on "${modules.find(m => m._id === selectedModule)?.title}".`
            });
            setSeconds(25 * 60);
            setSelectedModule("");
        } catch (error) {
            console.error(error);
            toast.error("Failed to save session");
        } finally {
            setLoading(false);
        }
    };

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const progress = ((25 * 60 - seconds) / (25 * 60)) * 100;

    return (
        <div className="space-y-8 max-w-4xl mx-auto py-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold text-foreground bg-clip-text">Deep Work Focus</h2>
                <p className="text-muted-foreground">Boost your learning efficiency with AI-monitored sessions.</p>
            </div>

            {!running ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-10 space-y-8 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"
                >
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Course</label>
                            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                <SelectTrigger className="h-12 bg-secondary/30 border-border/60 rounded-xl">
                                    <SelectValue placeholder="Which course are you studying?" />
                                </SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => (
                                        <SelectItem key={c._id} value={c._id || ""}>{c.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Current Module</label>
                            <Select value={selectedModule} onValueChange={setSelectedModule} disabled={!selectedCourse}>
                                <SelectTrigger className="h-12 bg-secondary/30 border-border/60 rounded-xl">
                                    <SelectValue placeholder="Select a module..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {modules.map(m => (
                                        <SelectItem key={m._id} value={m._id || ""}>{m.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-4">
                        <div className="p-4 rounded-2xl bg-secondary/20 border border-border/40 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                                <Camera className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Webcam</p>
                                <p className="text-xs font-semibold">Eye Tracking Enabled</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-secondary/20 border border-border/40 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                                <Layout className="w-5 h-5 text-accent" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Auto-Track</p>
                                <p className="text-xs font-semibold">Progress Syncs Late</p>
                            </div>
                        </div>
                        <div className="p-4 rounded-2xl bg-secondary/20 border border-border/40 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Rewards</p>
                                <p className="text-xs font-semibold">Earn SIP Credits</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full h-14 text-lg font-bold gradient-primary btn-glow rounded-2xl shadow-xl shadow-primary/20"
                        onClick={handleStart}
                        disabled={!selectedCourse || !selectedModule}
                    >
                        <Play className="w-5 h-5 mr-3 fill-current" /> Initialize Session
                    </Button>
                </motion.div>
            ) : (
                <div className="grid lg:grid-cols-5 gap-8">
                    {/* Left Column: Timer and Controls */}
                    <div className="lg:col-span-3 space-y-8 flex flex-col items-center">
                        <AnimatePresence>
                            {!isFaceDetected && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="w-full"
                                >
                                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/50 animate-bounce-slow">
                                        <ShieldAlert className="h-4 w-4" />
                                        <AlertTitle>Attention Required!</AlertTitle>
                                        <AlertDescription>
                                            We can't detect you. Please stay within the camera frame to keep your session active.
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <motion.div
                            className="relative w-72 h-72 flex items-center justify-center"
                            animate={running ? {
                                boxShadow: isFaceDetected
                                    ? ["0 0 0 0 hsl(230 80% 56% / 0.3)", "0 0 0 20px hsl(230 80% 56% / 0)", "0 0 0 0 hsl(230 80% 56% / 0.3)"]
                                    : ["0 0 0 0 hsl(0 80% 56% / 0.3)", "0 0 0 20px hsl(0 80% 56% / 0)", "0 0 0 0 hsl(0 80% 56% / 0.3)"]
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ borderRadius: "50%" }}
                        >
                            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 224 224">
                                <circle cx="112" cy="112" r="100" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                                <circle
                                    cx="112" cy="112" r="100" fill="none"
                                    stroke={isFaceDetected ? "url(#timerGradient)" : "hsl(var(--destructive))"}
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 100}`}
                                    strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
                                    className="transition-all duration-1000"
                                />
                                <defs>
                                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="hsl(230, 80%, 56%)" />
                                        <stop offset="100%" stopColor="hsl(270, 70%, 60%)" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="text-center z-10">
                                <span className="text-6xl font-black text-foreground tabular-nums tracking-tighter">
                                    {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                                </span>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">Time Remaining</p>
                            </div>
                        </motion.div>

                        <div className="flex items-center gap-4 w-full">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-14 w-14 rounded-2xl border-border/60 hover:bg-secondary transition-all"
                                onClick={() => { setRunning(false); setSeconds(25 * 60); }}
                            >
                                <RotateCcw className="w-6 h-6" />
                            </Button>
                            <Button
                                size="lg"
                                className="flex-1 h-14 text-lg font-bold gradient-primary text-white btn-glow rounded-2xl"
                                onClick={handleEndSession}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Pause className="w-5 h-5 mr-3 fill-current" /> Save Session & Take Break</>}
                            </Button>
                        </div>

                        <div className="glass-card p-4 w-full flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Studying</p>
                                    <p className="text-sm font-semibold truncate max-w-[150px]">{modules.find(m => m._id === selectedModule)?.title}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none">Status</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className={`w-2 h-2 rounded-full ${isFaceDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                    <span className="text-xs font-bold">{isFaceDetected ? 'Active' : 'Alert'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: WebCam View */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="relative group aspect-video rounded-3xl overflow-hidden border-2 border-border/40 shadow-2xl bg-black">
                            {(() => {
                                const WebcamComp = Webcam as any;
                                return (
                                    <WebcamComp
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        className="w-full h-full object-cover grayscale brightness-125 contrast-125"
                                        mirrored={true}
                                    />
                                );
                            })()}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-4 left-4 p-2 bg-black/50 backdrop-blur-md rounded-lg flex items-center gap-2 border border-white/10">
                                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Live Detection</span>
                            </div>

                            {!isFaceDetected && (
                                <div className="absolute inset-0 border-4 border-destructive/80 animate-pulse pointer-events-none" />
                            )}

                            {/* Face Guide Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
                                <div className="w-48 h-64 border-2 border-white/50 border-dashed rounded-[60px]" />
                            </div>
                        </div>

                        <div className="glass-card p-5 space-y-4">
                            <h4 className="font-bold text-sm flex items-center gap-2"><LayoutIcon className="w-4 h-4 text-primary" /> How it works</h4>
                            <ul className="text-xs text-muted-foreground space-y-3">
                                <li className="flex gap-2">
                                    <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-[10px] font-bold">1</div>
                                    <span>Our AI uses your camera to monitor your focus levels in real-time.</span>
                                </li>
                                <li className="flex gap-2">
                                    <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-[10px] font-bold">2</div>
                                    <span>If you look away or leave your seat, we'll give you a gentle nudge.</span>
                                </li>
                                <li className="flex gap-2">
                                    <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 text-[10px] font-bold">3</div>
                                    <span>Finish the session to earn SIP credits and sync proof of work.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function LayoutIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
    );
}

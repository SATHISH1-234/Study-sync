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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
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
    const [trackingEnabled, setTrackingEnabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const [focusLost, setFocusLost] = useState(false);
    const [missingFrames, setMissingFrames] = useState(0);

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

    useEffect(() => {
        if (user?._id) {
            setLoading(true);
            api.get(`/groups/student/${user._id}`)
                .then(res => {
                    const enrolledCourses = res.data.data?.map((g: any) => g.courseId).filter(Boolean) || [];
                    setCourses(enrolledCourses);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
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
        if (running && modelsLoaded && trackingEnabled) {
            detectionRef.current = setInterval(async () => {
                if (webcamRef.current && webcamRef.current.video) {
                    const video = webcamRef.current.video;
                    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());

                    if (detections.length === 0) {
                        setMissingFrames(prev => {
                            const next = prev + 1;
                            if (next >= 2) { // About 4 seconds of missing face
                                setFocusLost(true);
                                setRunning(false);
                                setIsFaceDetected(false);
                                return 0;
                            }
                            return next;
                        });
                    } else {
                        setMissingFrames(0);
                        setIsFaceDetected(true);
                    }
                }
            }, 2000); // Check every 2 seconds
        } else {
            if (detectionRef.current) clearInterval(detectionRef.current);
            // Don't reset isFaceDetected here as it might be needed for the UI state
        }
        return () => {
            if (detectionRef.current) clearInterval(detectionRef.current);
        };
    }, [running, modelsLoaded, trackingEnabled]);

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
        toast.info("Neural Nexus Initialized", {
            description: "Stay locked in! You have to focus on your studies to maximize SIP credits.",
        });
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

    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        let videoId = url.split('v=')[1];
        if (videoId) {
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                videoId = videoId.substring(0, ampersandPosition);
            }
            return `https://www.youtube.com/embed/${videoId}`;
        }
        if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1];
            if (videoId) {
                const queryPosition = videoId.indexOf('?');
                if (queryPosition !== -1) {
                    videoId = videoId.substring(0, queryPosition);
                }
                return `https://www.youtube.com/embed/${videoId}`;
            }
        }
        return url;
    };

    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const progress = ((25 * 60 - seconds) / (25 * 60)) * 100;
    const activeModule = modules.find(m => m._id === selectedModule);
    const videoUrl = activeModule?.videoEmbedLink ? getEmbedUrl(activeModule.videoEmbedLink) : null;

    return (
        <div className="space-y-8 max-w-6xl mx-auto py-6 px-4">
            <div className="text-center space-y-2">
                <h2 className="text-4xl font-black text-foreground tracking-tighter italic">NEURAL FOCUS <span className="text-primary">CORE</span></h2>
                <p className="text-muted-foreground font-medium">Activate deep learning state with AI biometrics.</p>
            </div>

            {loading && (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-sm font-medium text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Syncing Neural Data...</p>
                </div>
            )}

            {!loading && courses.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-12 text-center border-dashed border-primary/40 space-y-6"
                >
                    <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto">
                        <ShieldAlert className="w-10 h-10 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold">No Active Enrollments</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">You must be enrolled in at least one approved course to initialize a neural focus session.</p>
                    </div>
                    <Button onClick={() => window.location.href = '/student/courses'} className="gradient-primary px-8 h-12 font-bold uppercase tracking-widest">
                        Explore Courses
                    </Button>
                </motion.div>
            )}

            {courses.length > 0 && !running ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-10 space-y-8 border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                    <div className="grid md:grid-cols-2 gap-8 relative z-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Protocol Course</label>
                            <Select value={selectedCourse} onValueChange={(val) => { if (val !== "none") setSelectedCourse(val); }}>
                                <SelectTrigger className="h-14 bg-secondary/20 border-border/40 rounded-2xl text-base font-semibold">
                                    <SelectValue placeholder="Identify subject..." />
                                </SelectTrigger>
                                <SelectContent className="glass-card">
                                    {courses.length > 0 ? courses.map(c => (
                                        <SelectItem key={c._id} value={c._id || ""} className="font-medium">{c.title}</SelectItem>
                                    )) : (
                                        <SelectItem value="none" disabled>No courses found</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Learning Module</label>
                            <Select value={selectedModule} onValueChange={(val) => { if (val !== "none") setSelectedModule(val); }} disabled={!selectedCourse}>
                                <SelectTrigger className="h-14 bg-secondary/20 border-border/40 rounded-2xl text-base font-semibold">
                                    <SelectValue placeholder="Select target node..." />
                                </SelectTrigger>
                                <SelectContent className="glass-card">
                                    {modules.length > 0 ? modules.map(m => (
                                        <SelectItem key={m._id} value={m._id || ""} className="font-medium">{m.title}</SelectItem>
                                    )) : (
                                        <SelectItem value="none" disabled>No modules available</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 pt-4 relative z-10">
                        <div className="p-5 rounded-3xl bg-secondary/10 border border-border/40 flex items-center gap-4 hover:bg-secondary/20 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                <Camera className="w-6 h-6 text-primary" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vision API</p>
                                <p className="text-sm font-bold">Active Tracking</p>
                            </div>
                        </div>
                        <div className="p-5 rounded-3xl bg-secondary/10 border border-border/40 flex items-center gap-4 hover:bg-secondary/20 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20">
                                <Layout className="w-6 h-6 text-accent" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Proof of Work</p>
                                <p className="text-sm font-bold">Auto-Syncing</p>
                            </div>
                        </div>
                        <div className="p-5 rounded-3xl bg-secondary/10 border border-border/40 flex items-center gap-4 hover:bg-secondary/20 transition-colors">
                            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                                <CheckCircle2 className="w-6 h-6 text-green-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Neural Yield</p>
                                <p className="text-sm font-bold">SIP Credits</p>
                            </div>
                        </div>
                    </div>

                    <Button
                        className="w-full h-16 text-xl font-black gradient-primary btn-glow rounded-3xl shadow-2xl shadow-primary/20 uppercase tracking-[0.3em] italic"
                        onClick={handleStart}
                        disabled={!selectedCourse || !selectedModule || !modelsLoaded}
                    >
                        <Play className="w-6 h-6 mr-4 fill-current" /> {modelsLoaded ? "Initialize Session" : "Loading Neural Engine..."}
                    </Button>
                </motion.div>
            ) : null}

            {running && (
                <div className="relative h-[80vh] md:h-[70vh] w-full flex items-center justify-center bg-card/30 backdrop-blur-xl rounded-[30px] md:rounded-[40px] border border-border/40 overflow-hidden shadow-3xl">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5" />

                    {/* Corner Video Box - Top Right */}
                    <div className="absolute top-4 right-4 md:top-10 md:right-10 w-32 md:w-60 aspect-video rounded-xl md:rounded-2xl overflow-hidden border-2 md:border-4 border-background/50 shadow-2xl bg-black z-50 ring-1 ring-primary/20 group transition-all hover:scale-105 duration-500">
                        {(() => {
                            const WebcamComp = Webcam as any;
                            return (
                                <WebcamComp
                                    audio={false}
                                    ref={webcamRef}
                                    className="w-full h-full object-cover grayscale brightness-110 contrast-125"
                                    mirrored={true}
                                />
                            );
                        })()}
                        <div className="absolute inset-0 border-2 border-primary/20 rounded-2xl pointer-events-none" />
                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                            <div className={`w-1.5 h-1.5 rounded-full ${isFaceDetected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                            <span className="text-[8px] font-black text-white uppercase tracking-tighter">AI Eye-Tracking</span>
                        </div>
                        {!isFaceDetected && (
                            <div className="absolute inset-0 border-4 border-destructive/80 animate-pulse pointer-events-none" />
                        )}
                    </div>



                    {/* Main Content Area - Video + Floating Timer */}
                    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-4 md:p-10 gap-4 md:gap-8">
                        {videoUrl ? (
                            <div className="w-full max-w-4xl aspect-video rounded-[32px] overflow-hidden border-4 border-white/5 shadow-2xl bg-black/40 backdrop-blur-md relative group">
                                <iframe
                                    src={videoUrl}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>

                                {/* Floating Overlay Timer when Video is present */}
                                <div className="absolute bottom-6 left-6 flex items-center gap-4 bg-black/60 backdrop-blur-xl p-4 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">
                                    <div className="text-center">
                                        <span className="text-3xl font-black italic tabular-nums text-white">
                                            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                                        </span>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-primary">Neural Lock</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="relative z-10 flex flex-col items-center gap-8">
                                <motion.div
                                    className="relative w-80 h-80 flex items-center justify-center"
                                    animate={running ? {
                                        boxShadow: isFaceDetected
                                            ? ["0 0 0 0 hsl(230 80% 56% / 0.2)", "0 0 0 40px hsl(230 80% 56% / 0)", "0 0 0 0 hsl(230 80% 56% / 0.2)"]
                                            : ["0 0 0 0 hsl(0 80% 56% / 0.4)", "0 0 0 60px hsl(0 80% 56% / 0)", "0 0 0 0 hsl(0 80% 56% / 0.4)"]
                                    } : {}}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <svg className="absolute inset-0 -rotate-90" viewBox="0 0 224 224">
                                        <circle cx="112" cy="112" r="105" fill="none" stroke="hsl(var(--secondary)/0.3)" strokeWidth="10" />
                                        <circle
                                            cx="112" cy="112" r="105" fill="none"
                                            stroke={isFaceDetected ? "url(#timerGradient)" : "hsl(var(--destructive))"}
                                            strokeWidth="10"
                                            strokeLinecap="round"
                                            strokeDasharray={`${2 * Math.PI * 105}`}
                                            strokeDashoffset={`${2 * Math.PI * 105 * (1 - progress / 100)}`}
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
                                        <span className="text-6xl md:text-8xl font-black italic tabular-nums tracking-tighter transition-colors duration-500 [font-variant-numeric:tabular-nums]">
                                            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
                                        </span>
                                        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-muted-foreground mt-2 md:mt-4">Remaining Lock-in</p>
                                    </div>
                                </motion.div>
                            </div>
                        )}

                        <div className="flex items-center gap-6">
                            <Button
                                variant="outline"
                                title="Pause Tracking"
                                className="h-16 w-16 rounded-[20px] border-border/60 hover:bg-secondary/50 transition-all hover:scale-110 active:scale-95"
                                onClick={() => setRunning(false)}
                            >
                                <Pause className="w-7 h-7" />
                            </Button>
                            <Button
                                size="lg"
                                className="px-10 h-16 text-lg font-black gradient-primary text-white btn-glow rounded-[20px] uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-95 transition-transform"
                                onClick={handleEndSession}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><CheckCircle2 className="w-6 h-6 mr-4 fill-current" /> Finish & Sync</>}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                title="Discard Session"
                                className="h-16 w-16 rounded-[20px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                onClick={() => { if (confirm("Discard current neural session?")) { setRunning(false); setSeconds(25 * 60); setSelectedModule(""); } }}
                            >
                                <RotateCcw className="w-7 h-7" />
                            </Button>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="absolute top-4 left-4 right-4 md:top-10 md:left-10 md:right-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 pointer-events-none md:pointer-events-auto">
                        <div className="flex items-center gap-3 md:gap-4 bg-background/40 backdrop-blur-md px-4 py-2 md:px-6 md:py-3 rounded-xl md:rounded-2xl border border-white/5 pointer-events-auto">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-primary/20 flex items-center justify-center">
                                <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase leading-none mb-1 tracking-tighter">Current Matrix</p>
                                <p className="text-xs md:text-sm font-bold truncate max-w-[120px] md:max-w-[200px] italic">{modules.find(m => m._id === selectedModule)?.title}</p>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <div className="text-right">
                                <p className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-2 tracking-tighter">AI Monitoring</p>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-6 px-3 text-[9px] font-black uppercase rounded-lg border flex items-center gap-2 transition-all ${trackingEnabled ? 'border-primary/20 text-primary bg-primary/5' : 'border-destructive/20 text-destructive bg-destructive/5'}`}
                                    onClick={() => setTrackingEnabled(!trackingEnabled)}
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full ${trackingEnabled ? 'bg-primary' : 'bg-destructive'}`} />
                                    {trackingEnabled ? 'ACTIVE' : 'MUTED'}
                                </Button>
                            </div>

                            <div className="text-right border-l border-border/40 pl-8">
                                <p className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-1 tracking-tighter">Signal Stability</p>
                                <div className="flex items-center gap-2 mt-1.5">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4].map(x => (
                                            <div key={x} className={`w-1 h-3 rounded-full ${isFaceDetected && trackingEnabled ? (x <= 3 ? 'bg-primary' : 'bg-primary/30') : 'bg-destructive animate-pulse'}`} />
                                        ))}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase ${isFaceDetected && trackingEnabled ? 'text-primary' : 'text-destructive'}`}>
                                        {isFaceDetected && trackingEnabled ? 'OPTIMIZED' : 'INTERFERENCE'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Dialog open={focusLost} onOpenChange={setFocusLost}>
                <DialogContent className="glass-card border-destructive/30 sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic flex items-center gap-3 text-destructive">
                            <ShieldAlert className="w-8 h-8" /> REGAIN FOCUS
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground font-medium pt-2">
                            You have to focus on your studies! Your AI biometric signal has been lost. Re-align with the camera to continue your learning journey.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-6 flex flex-col items-center justify-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 animate-pulse">
                            <Camera className="w-10 h-10 text-destructive" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest text-destructive/80">Biometric Scan Failed</p>
                    </div>
                    <DialogFooter className="sm:justify-center">
                        <Button
                            className="w-full gradient-primary h-12 font-black uppercase tracking-widest"
                            onClick={() => {
                                setFocusLost(false);
                                setMissingFrames(0);
                                setIsFaceDetected(true);
                                setRunning(true);
                            }}
                        >
                            <Play className="w-4 h-4 mr-2 fill-current" /> Resume Neural Lock
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function LayoutIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
    );
}

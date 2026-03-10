import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft, Play, CheckCircle2, Lock, Users, BookOpen, Clock,
    ChevronRight, LayoutDashboard, Target, FolderOpen,
    Brain, BarChart3, Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { toast } from "sonner";

const navItems = [
    { label: "Dashboard", path: "/student", icon: LayoutDashboard },
    { label: "My Courses", path: "/student/courses", icon: BookOpen },
    { label: "Messages", path: "/chat", icon: Users },
    { label: "Focus Mode", path: "/student/focus", icon: Target },
    { label: "Resources", path: "/student/resources", icon: FolderOpen },
    { label: "AI Reminders", path: "/student/reminders", icon: Brain },
    { label: "Progress", path: "/student/progress", icon: BarChart3 },
];

export default function CourseDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [course, setCourse] = useState<any>(null);
    const [modules, setModules] = useState<any[]>([]);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [enrolling, setEnrolling] = useState(false);
    const [enrollmentRequested, setEnrollmentRequested] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [completedModules, setCompletedModules] = useState<string[]>([]);

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [courseRes, moduleRes, groupRes, statusRes, progressRes] = await Promise.all([
                    api.get(`/courses/${id}`),
                    api.get(`/modules/${id}`),
                    api.get(`/groups/student/${user?._id}`),
                    api.get(`/enrollments/status/${id}`),
                    api.get(`/progress/${id}`)
                ]);

                setCourse(courseRes.data.data);
                setModules(moduleRes.data.data);
                setCompletedModules(progressRes.data.data?.completedModules || []);

                // Check if student is in the group for this course
                const enrolled = (groupRes.data.data || []).some((g: any) => g.courseId?._id === id || g.courseId === id);
                setIsEnrolled(enrolled);

                // If not enrolled, check if request is pending
                if (!enrolled && statusRes.data.data?.status === 'pending') {
                    setEnrollmentRequested(true);
                }

                if (enrolled && moduleRes.data.data.length > 0) {
                    setSelectedVideo(moduleRes.data.data[0].videoEmbedLink);
                }
            } catch (err) {
                toast.error("Failed to load course details");
            } finally {
                setLoading(false);
            }
        };

        if (id && user?._id) fetchData();
    }, [id, user?._id]);

    const handleEnroll = async () => {
        try {
            setEnrolling(true);
            await api.post(`/courses/${id}/enroll`);
            toast.success("Request sent successfully! Mentor will approve you soon.");
            setEnrollmentRequested(true);
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Enrollment failed");
        } finally {
            setEnrolling(false);
        }
    };

    if (loading) return (
        <DashboardLayout navItems={navItems} role="student" title="Loading Course...">
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout navItems={navItems} role="student" title={course?.title || "Course Details"}>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto">
                <div className="flex items-center gap-2 mb-6">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/student/courses")} className="text-muted-foreground hover:text-foreground group">
                        <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to My Learning Path
                    </Button>
                </div>
                
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase mb-2">{course?.title}</h1>
                    <div className="flex items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary" /> {course?.studentsCount || 0} Students</span>
                        <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5 text-primary" /> {modules.length} Lessons</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 pb-10">
                    <div className="lg:col-span-2 space-y-8">
                        {isEnrolled ? (
                            <div className="glass-card overflow-hidden aspect-video bg-black rounded-3xl shadow-2xl relative group border-primary/10">
                                {selectedVideo ? (
                                    <iframe
                                        src={getEmbedUrl(selectedVideo)}
                                        className="w-full h-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                                        <Play className="w-12 h-12 opacity-20" />
                                        <p className="text-sm font-bold uppercase tracking-widest italic">Video not available</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                        <div className="glass-card p-12 text-center space-y-8 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-[32px] border-primary/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto border border-primary/20 shadow-xl">
                                <Lock className="w-12 h-12 text-primary" />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black italic uppercase tracking-tight">Access Course</h2>
                                <p className="text-muted-foreground max-w-md mx-auto font-medium leading-relaxed">
                                    {enrollmentRequested
                                        ? "Request sent. Waiting for mentor to approve your access."
                                        : "Enroll in this course to access the content and join the study group."}
                                </p>
                            </div>
                            <Button
                                onClick={handleEnroll}
                                disabled={enrolling || enrollmentRequested}
                                size="lg"
                                className={`h-14 px-12 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl ${enrollmentRequested ? 'bg-secondary/40 text-muted-foreground cursor-not-allowed border border-border/40' : 'gradient-primary btn-glow shadow-primary/20'}`}
                            >
                                {enrollmentRequested ? "Request Sent" : (enrolling ? "Enrolling..." : "Enroll Now")}
                            </Button>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-sm font-black italic uppercase tracking-[0.2em] flex items-center gap-3 px-1 text-primary">
                            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                                <BookOpen className="w-3.5 h-3.5" />
                            </div>
                            Course Description
                        </h3>
                        <div className="glass-card p-8 rounded-[24px] border-primary/5 bg-secondary/5">
                            <p className="text-muted-foreground leading-relaxed font-medium italic">{course?.description}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="glass-card p-6 space-y-6 shadow-xl border-primary/10 bg-secondary/10 rounded-[28px]">
                        <h3 className="text-xs font-black italic uppercase tracking-[0.2em] flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" /> Course Lessons
                        </h3>
                        <div className="space-y-3">
                            {modules.map((mod, idx) => (
                                <div
                                    key={mod._id}
                                    onClick={() => {
                                        if (isEnrolled) {
                                            setSelectedVideo(mod.videoEmbedLink);
                                            api.post('/progress/update', { courseId: id, moduleId: mod._id });
                                            if (!completedModules.includes(mod._id)) {
                                                setCompletedModules([...completedModules, mod._id]);
                                            }
                                        }
                                    }}
                                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer group ${selectedVideo === mod.videoEmbedLink
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                        : isEnrolled
                                            ? "bg-secondary/40 hover:bg-secondary/60 border border-transparent hover:border-primary/20"
                                            : "opacity-60 cursor-not-allowed grayscale"
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black italic text-xs ${selectedVideo === mod.videoEmbedLink ? "bg-white/20" : "bg-primary/10 text-primary border border-primary/10"
                                        }`}>
                                        {isEnrolled ? (
                                            completedModules.includes(mod._id) ? <CheckCircle2 className="w-5 h-5" /> : idx + 1
                                        ) : <Lock className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate tracking-tight">{mod.title}</p>
                                        <p className={`text-[9px] font-black uppercase tracking-widest ${selectedVideo === mod.videoEmbedLink ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                            Video Lesson
                                        </p>
                                    </div>
                                    {isEnrolled && <Play className={`w-4 h-4 transition-transform ${selectedVideo === mod.videoEmbedLink ? 'opacity-100 scale-110' : 'opacity-20 group-hover:opacity-100 group-hover:translate-x-1'}`} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {isEnrolled && (
                        <div className="glass-card p-8 space-y-6 bg-gradient-to-br from-accent/10 via-transparent to-primary/10 border-accent/20 rounded-[28px] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16" />
                            <div className="flex items-center gap-3 text-accent mb-1 relative z-10">
                                <Users className="w-6 h-6" />
                                <h3 className="text-lg font-black italic uppercase tracking-tighter">Study Group</h3>
                            </div>
                            <p className="text-xs text-muted-foreground italic font-medium relative z-10 leading-relaxed">
                                Connect with your classmates and share resources in the community chat.
                            </p>
                            <Button variant="outline" className="w-full h-12 rounded-xl border-accent/30 text-accent hover:bg-accent/10 font-bold uppercase tracking-widest text-[10px] relative z-10 btn-glow border-accent/50" onClick={() => navigate("/chat")}>
                                Launch Group Chat
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </DashboardLayout>
    );
}


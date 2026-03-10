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
            <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout navItems={navItems} role="student" title={course?.title || "Course Details"}>
            <div className="flex items-center gap-2 mb-6">
                <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Courses
                </Button>
            </div>
            <div className="grid lg:grid-cols-3 gap-6 pb-10">
                <div className="lg:col-span-2 space-y-6">
                    {isEnrolled ? (
                        <div className="glass-card overflow-hidden aspect-video bg-black rounded-2xl shadow-2xl relative group">
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
                                    <p>No video available for this module.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="glass-card p-12 text-center space-y-6 bg-gradient-to-br from-primary/5 to-accent/5">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                                <Lock className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-foreground">Course Content Locked</h2>
                                <p className="text-muted-foreground max-w-md mx-auto italic">
                                    {enrollmentRequested
                                        ? "Your request has been sent! Please wait for the mentor's approval to access this course."
                                        : "Request to join this course and the mentor will approve you soon!"}
                                </p>
                            </div>
                            <Button
                                onClick={handleEnroll}
                                disabled={enrolling || enrollmentRequested}
                                size="lg"
                                className={`px-12 ${enrollmentRequested ? 'bg-secondary text-muted-foreground cursor-not-allowed' : 'gradient-primary btn-glow'}`}
                            >
                                {enrollmentRequested ? "Request Pending" : (enrolling ? "Sending Request..." : "Request Enrollment")}
                            </Button>
                        </div>
                    )}

                    <div className="space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2 px-1">
                            <BookOpen className="w-5 h-5 text-primary" /> About this Course
                        </h3>
                        <div className="glass-card p-6">
                            <p className="text-muted-foreground leading-relaxed italic">{course?.description}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass-card p-6 space-y-4 shadow-lg border-primary/20 bg-secondary/10">
                        <h3 className="font-bold flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" /> Course Outline
                        </h3>
                        <div className="space-y-2">
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
                                    className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${selectedVideo === mod.videoEmbedLink
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : isEnrolled
                                            ? "bg-secondary/30 hover:bg-secondary/50"
                                            : "opacity-60 cursor-not-allowed"
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedVideo === mod.videoEmbedLink ? "bg-white/20" : "bg-primary/10 text-primary"
                                        }`}>
                                        {isEnrolled ? (
                                            completedModules.includes(mod._id) ? <CheckCircle2 className="w-4 h-4" /> : idx + 1
                                        ) : <Lock className="w-3.5 h-3.5" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{mod.title}</p>
                                        <p className={`text-[10px] ${selectedVideo === mod.videoEmbedLink ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                            Video Content
                                        </p>
                                    </div>
                                    {isEnrolled && <Play className="w-4 h-4 opacity-50" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {isEnrolled && (
                        <div className="glass-card p-6 space-y-4 bg-gradient-to-br from-accent/10 to-primary/10 border-accent/20">
                            <div className="flex items-center gap-3 text-accent mb-1">
                                <Users className="w-5 h-5" />
                                <h3 className="font-bold">Study Group</h3>
                            </div>
                            <p className="text-xs text-muted-foreground italic">You are part of the study group for this course. Chat with peers and share resources!</p>
                            <Button variant="outline" className="w-full border-accent/50 text-accent hover:bg-accent/10" onClick={() => navigate("/chat")}>
                                Go to Group Chat
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

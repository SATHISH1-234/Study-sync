import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, Plus, Trash2, Video, LayoutDashboard, BookOpen, Users, GraduationCap, FolderOpen, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/api";

const navItems = [
    { label: "Dashboard", path: "/mentor", icon: LayoutDashboard },
    { label: "My Courses", path: "/mentor/courses", icon: BookOpen },
    { label: "Messages", path: "/chat", icon: Users },
    { label: "Students", path: "/mentor/students", icon: GraduationCap },
    { label: "Resources", path: "/mentor/resources", icon: FolderOpen },
    { label: "Performance", path: "/mentor/performance", icon: BarChart3 },
];

export default function CreateCourse() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [course, setCourse] = useState({
        title: "",
        description: "",
    });
    const [modules, setModules] = useState([
        { title: "", description: "", videoEmbedLink: "", order: 1 }
    ]);

    const addModule = () => {
        setModules([...modules, { title: "", description: "", videoEmbedLink: "", order: modules.length + 1 }]);
    };

    const removeModule = (index: number) => {
        if (modules.length === 1) return;
        const newModules = modules.filter((_, i) => i !== index);
        setModules(newModules.map((m, i) => ({ ...m, order: i + 1 })));
    };

    const getEmbedUrl = (url: string) => {
        if (!url) return "";
        // Handle youtube.com/watch?v=ID
        let videoId = url.split('v=')[1];
        if (videoId) {
            const ampersandPosition = videoId.indexOf('&');
            if (ampersandPosition !== -1) {
                videoId = videoId.substring(0, ampersandPosition);
            }
            return `https://www.youtube.com/embed/${videoId}`;
        }
        // Handle youtu.be/ID
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

    const handleModuleChange = (index: number, field: string, value: string) => {
        const newModules = [...modules];
        if (field === "videoEmbedLink") {
            (newModules[index] as any)[field] = getEmbedUrl(value);
        } else {
            (newModules[index] as any)[field] = value;
        }
        setModules(newModules);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!course.title || !course.description) {
            return toast.error("Please fill course details");
        }

        try {
            setLoading(true);
            // 1. Create Course
            const courseRes = await api.post("/courses", course);
            const courseId = courseRes.data.data._id;

            // 2. Create Modules
            for (const mod of modules) {
                if (mod.title) {
                    await api.post("/modules", { ...mod, courseId });
                }
            }

            toast.success("Course and modules created successfully! Group created automatically.");
            navigate("/mentor/courses");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create course");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout navItems={navItems} role="mentor" title="Create New Course">
            <div className="max-w-4xl mx-auto pb-20">
                <div className="mb-6 flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => navigate("/mentor/courses")} className="text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to My Courses
                    </Button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="glass-card p-6 space-y-4">
                        <h3 className="text-lg font-bold text-foreground">Course Information</h3>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Course Title</label>
                            <Input
                                placeholder="e.g. Advanced React Architecture"
                                value={course.title}
                                onChange={(e) => setCourse({ ...course, title: e.target.value })}
                                className="bg-secondary/30"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                placeholder="Describe what students will learn..."
                                value={course.description}
                                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                className="bg-secondary/30 min-h-[100px]"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-foreground">Course Modules</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addModule} className="border-primary/50 text-primary">
                                <Plus className="w-4 h-4 mr-2" /> Add Module
                            </Button>
                        </div>

                        {modules.map((mod, index) => (
                            <div key={index} className="glass-card p-6 space-y-4 relative group">
                                <div className="flex justify-between items-start">
                                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">Module {index + 1}</span>
                                    {modules.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeModule(index)} className="text-destructive hover:bg-destructive/10">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Module Title</label>
                                        <Input
                                            placeholder="e.g. Introduction to Hooks"
                                            value={mod.title}
                                            onChange={(e) => handleModuleChange(index, "title", e.target.value)}
                                            className="bg-secondary/30"
                                        />
                                    </div>
                                    <label className="text-sm font-medium flex items-center gap-2"><Video className="w-4 h-4" /> Video Link</label>
                                    <Input
                                        placeholder="Paste YouTube link here..."
                                        value={mod.videoEmbedLink}
                                        onChange={(e) => handleModuleChange(index, "videoEmbedLink", e.target.value)}
                                        className="bg-secondary/30"
                                    />
                                    <p className="text-[10px] text-muted-foreground mt-1 italic">
                                        💡 Paste any YouTube link (e.g. watch?v=... or youtu.be/...) and we'll automatically convert it for you!
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Module Description (Optional)</label>
                                    <Input
                                        placeholder="Briefly explain this module..."
                                        value={mod.description}
                                        onChange={(e) => handleModuleChange(index, "description", e.target.value)}
                                        className="bg-secondary/30"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => navigate("/mentor/courses")} disabled={loading}>Cancel</Button>
                        <Button type="submit" className="gradient-primary btn-glow px-10" disabled={loading}>
                            {loading ? "Creating..." : "Launch Course"}
                        </Button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

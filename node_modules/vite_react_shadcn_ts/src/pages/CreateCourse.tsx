import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    ChevronLeft, Plus, Trash2, Video, BookOpen, 
    LayoutDashboard, Users, GraduationCap, FolderOpen, 
    BarChart3, Loader2 
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/utils/api";

export default function CreateCourse() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [titleError, setTitleError] = useState("");
    const [course, setCourse] = useState({
        title: "",
        description: "",
    });
    const [modules, setModules] = useState([
        { title: "", description: "", videoEmbedLink: "", order: 1 }
    ]);

    const checkTitleExists = async (title: string) => {
        if (!title.trim() || title.length < 3) {
            setTitleError("");
            return;
        }
        try {
            const res = await api.get(`/courses/check-title?title=${encodeURIComponent(title.trim())}`);
            if (res.data.exists) {
                setTitleError("A course with this exact title already exists in the system.");
            } else {
                setTitleError("");
            }
        } catch (err) {
            console.error("Error checking title:", err);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setCourse({ ...course, title: newTitle });
        checkTitleExists(newTitle);
    };

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
        if (titleError) {
            return toast.error("Course title already exists. Please choose a unique title.");
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
        <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-6 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => navigate("/mentor/courses")} className="text-muted-foreground hover:text-foreground group">
                    <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to My Courses
                </Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="glass-card p-8 space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
                    <h3 className="text-xl font-black text-foreground italic uppercase flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        Course Information
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Title</label>
                            <Input
                                placeholder="e.g. Advanced React Architecture"
                                value={course.title}
                                onChange={handleTitleChange}
                                className={`bg-secondary/20 h-12 rounded-xl focus:ring-1 ${titleError ? 'border-destructive focus:ring-destructive' : 'border-border/60 focus:ring-primary/30'}`}
                            />
                            {titleError && <p className="text-[10px] text-destructive font-bold mt-1 ml-1 animate-pulse italic">{titleError}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary ml-1">Learning Directive</label>
                            <Textarea
                                placeholder="Describe what students will learn in this neural cluster..."
                                value={course.description}
                                onChange={(e) => setCourse({ ...course, description: e.target.value })}
                                className="bg-secondary/20 min-h-[120px] rounded-xl border-border/60 focus:ring-1 focus:ring-primary/30 resize-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-lg font-black text-foreground italic uppercase tracking-tight">Sequence Modules</h3>
                        <Button type="button" variant="outline" size="sm" onClick={addModule} className="h-9 border-primary/20 text-primary hover:bg-primary/5 rounded-xl font-bold uppercase text-[10px] tracking-widest px-4">
                            <Plus className="w-4 h-4 mr-2" /> Add Sequence
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {modules.map((mod, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-6 space-y-6 relative group border-primary/5 hover:border-primary/20 transition-all"
                            >
                                <div className="flex justify-between items-center pb-2 border-b border-border/20">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-black text-primary text-xs italic">
                                            {index + 1}
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Neural Module {index + 1}</span>
                                    </div>
                                    {modules.length > 1 && (
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeModule(index)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Module Meta Title</label>
                                        <Input
                                            placeholder="e.g. Introduction to Hooks"
                                            value={mod.title}
                                            onChange={(e) => handleModuleChange(index, "title", e.target.value)}
                                            className="bg-secondary/10 h-11 rounded-xl border-border/40 focus:ring-1 focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                                            <Video className="w-3.5 h-3.5" /> Video Stream Link
                                        </label>
                                        <Input
                                            placeholder="Paste YouTube source..."
                                            value={mod.videoEmbedLink}
                                            onChange={(e) => handleModuleChange(index, "videoEmbedLink", e.target.value)}
                                            className="bg-secondary/10 h-11 rounded-xl border-border/40 focus:ring-1 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description (Optional Data)</label>
                                    <Input
                                        placeholder="Briefly explain this neural node..."
                                        value={mod.description}
                                        onChange={(e) => handleModuleChange(index, "description", e.target.value)}
                                        className="bg-secondary/10 h-11 rounded-xl border-border/40 focus:ring-1 focus:ring-primary/20"
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6">
                    <Button type="button" variant="ghost" onClick={() => navigate("/mentor/courses")} disabled={loading} className="font-bold uppercase tracking-widest text-[10px] rounded-xl h-12 px-8">Discard</Button>
                    <Button type="submit" className="gradient-primary btn-glow px-12 h-12 font-black uppercase tracking-[0.2em] text-[10px] rounded-xl shadow-xl shadow-primary/20" disabled={loading || !!titleError}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        {loading ? "Initializing..." : "Launch Course Cluster"}
                    </Button>
                </div>
            </form>
        </div>
    );
}


import { useNavigate, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import StudyGroupCard from "@/components/StudyGroupCard";
import CourseCard from "@/components/CourseCard";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, GraduationCap, FolderOpen, BarChart3, Clock, Loader2, Plus, BookOpen, Check, X, Link as LinkIcon, Target, Brain, Calendar, PlusCircle, Download, Trash2, ChevronRight, LifeBuoy, Send, MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CreateCourse from "./CreateCourse";

const navItems = [
  { label: "Dashboard", path: "/mentor", icon: LayoutDashboard },
  { label: "My Courses", path: "/mentor/courses", icon: BookOpen },
  { label: "Requests", path: "/mentor/requests", icon: Clock },
  { label: "Messages", path: "/chat", icon: Users },
  { label: "Students", path: "/mentor/students", icon: GraduationCap },
  { label: "Resources", path: "/mentor/resources", icon: FolderOpen },
  { label: "Performance", path: "/mentor/performance", icon: BarChart3 },
  { label: "Support", path: "/mentor/support", icon: LifeBuoy },
];

function DashboardHome() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [performance, setPerformance] = useState<any[]>([]);
  const [recentResources, setRecentResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ groups: 0, students: 0, courses: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      try {
        const [groupRes, courseRes, perfRes, resRes] = await Promise.all([
          api.get(`/groups/mentor/${user._id}`),
          api.get(`/courses/mentor/${user._id}`),
          api.get(`/progress/mentor/overview`),
          api.get(`/resources/mentor`)
        ]);

        setGroups(groupRes.data.data || []);
        setCourses(courseRes.data.data || []);
        setPerformance(perfRes.data.data?.slice(0, 3) || []);
        setRecentResources(resRes.data.data?.slice(0, 3) || []);

        const totalStudents = groupRes.data.data?.reduce((acc: number, g: any) => acc + (g.students?.length || 0), 0) || 0;

        setStats({
          groups: groupRes.data.count || 0,
          students: totalStudents,
          courses: courseRes.data.count || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?._id]);

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight italic uppercase">Mentor Dashboard</h2>
          <p className="text-muted-foreground font-medium mt-1">Manage your courses, students, and groups.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-10 border-primary/20 hover:bg-primary/5 text-primary text-[10px] font-black tracking-widest uppercase rounded-xl" onClick={() => navigate("/mentor/courses")}>View My Courses</Button>
          <Button className="h-10 gradient-primary btn-glow px-6 text-[10px] font-black uppercase tracking-widest rounded-xl" onClick={() => navigate("/mentor/courses/create")}>+ Create New Course</Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Active Courses" value={stats.courses} icon={BookOpen} />
        <StatCard title="Total Students" value={stats.students} icon={GraduationCap} color="accent" />
        <StatCard title="Study Groups" value={stats.groups} icon={Users} color="accent" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Your Study Groups</h3>
            <Button variant="link" size="sm" className="text-[10px] font-bold text-muted-foreground uppercase h-auto p-0" onClick={() => navigate("/mentor/groups")}>Go to Groups</Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {groups.length > 0 ? (
              groups.slice(0, 4).map((g) => (
                <StudyGroupCard
                  key={g._id}
                  name={g.groupName}
                  course={g.courseId?.title || "Course"}
                  mentor="You"
                  studentsCount={g.students?.length}
                  onClick={() => navigate("/mentor/students")}
                />
              ))
            ) : (
              <div className="col-span-full glass-card p-12 text-center text-muted-foreground italic border-dashed">
                No active neural groups found.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Performance Insight</h3>
              <Button variant="link" size="sm" className="text-[10px] font-bold text-muted-foreground uppercase h-auto p-0" onClick={() => navigate("/mentor/performance")}>Detailed Analytics</Button>
            </div>
            <div className="space-y-4">
              {performance.map((p, i) => (
                <motion.div
                  key={p._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-4 flex items-center justify-between border-primary/10 hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => navigate("/mentor/performance")}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-black text-sm italic group-hover:scale-110 transition-transform">
                      {p.studentId?.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{p.studentId?.name}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase">{p.courseId?.title}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-primary italic">{p.progressPercentage}%</p>
                    <div className="w-20 h-1 bg-secondary rounded-full mt-1">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${p.progressPercentage}%` }} />
                    </div>
                  </div>
                </motion.div>
              ))}
              {performance.length === 0 && <p className="text-sm text-muted-foreground italic px-2">Collecting performance telemetry...</p>}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Shared Resources</h3>
              <Button variant="link" size="sm" className="text-[10px] font-bold text-muted-foreground uppercase h-auto p-0" onClick={() => navigate("/mentor/resources")}>View Library</Button>
            </div>
            <div className="space-y-3">
              {recentResources.map((res, i) => (
                <div key={res._id} className="flex items-center gap-3 p-3 bg-secondary/20 rounded-2xl border border-border/40 hover:bg-secondary/30 transition-all">
                  <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-primary group-hover:text-primary transition-colors">
                    <FolderOpen className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-foreground truncate">{res.title}</h4>
                    <p className="text-[9px] text-muted-foreground uppercase">{res.groupId?.groupName}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => window.open(res.fileUrl, '_blank')}>
                    <LinkIcon className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              {recentResources.length === 0 && <p className="text-sm text-muted-foreground italic px-2">No resources shared yet. Start uploading files.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [managingModules, setManagingModules] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newModule, setNewModule] = useState({ title: "", description: "", videoEmbedLink: "", order: 1 });
  const [isAddingModule, setIsAddingModule] = useState(false);

  const fetchCourses = () => {
    if (user?._id) {
      api.get(`/courses/mentor/${user._id}`)
        .then(res => setCourses(res.data.data))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?._id]);

  const fetchModules = async (courseId: string) => {
    try {
      const res = await api.get(`/modules/course/${courseId}`);
      setModules(res.data.data || []);
      setNewModule(prev => ({ ...prev, order: (res.data.data?.length || 0) + 1 }));
    } catch (err) {
      toast.error("Failed to fetch modules");
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

  useEffect(() => {
    if (managingModules) {
      fetchModules(managingModules._id);
    }
  }, [managingModules]);

  const handleAddModule = async () => {
    if (!newModule.title) return toast.error("Module title is required");
    try {
      setIsAddingModule(true);
      const payload = {
        ...newModule,
        videoEmbedLink: getEmbedUrl(newModule.videoEmbedLink),
        courseId: managingModules._id
      };
      await api.post("/modules", payload);
      toast.success("Module added successfully!");
      setNewModule({ title: "", description: "", videoEmbedLink: "", order: modules.length + 2 });
      fetchModules(managingModules._id);
      fetchCourses(); // Update module count on courses page
    } catch (err) {
      toast.error("Failed to add module");
    } finally {
      setIsAddingModule(false);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return;
    try {
      await api.delete(`/modules/${id}`);
      toast.success("Module deleted");
      fetchModules(managingModules._id);
      fetchCourses();
    } catch (err) {
      toast.error("Failed to delete module");
    }
  };

  const handleUpdate = async () => {
    if (!editingCourse.title || !editingCourse.description) return toast.error("Please fill all fields");
    try {
      setIsUpdating(true);
      await api.put(`/courses/${editingCourse._id}`, {
        title: editingCourse.title,
        description: editingCourse.description
      });
      toast.success("Course updated successfully!");
      setEditingCourse(null);
      fetchCourses();
    } catch (err) {
      toast.error("Failed to update course");
    } finally {
      setIsUpdating(false);
    }
  };

  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">My Courses</h2>
        <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => navigate("/mentor/courses/create")}>
          <Plus className="w-4 h-4 mr-2" />Create New Course
        </Button>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : Array.isArray(courses) && courses.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <CourseCard
              key={c._id}
              name={c.title}
              students={c.studentsCount}
              modules={c.modulesCount}
              mentor="You"
              onView={() => setManagingModules(c)}
              onEdit={() => setEditingCourse(c)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>You haven't created any courses yet.</p>
        </div>
      )}

      {/* Edit Course Dialog */}
      <Dialog open={!!editingCourse} onOpenChange={(open) => !open && setEditingCourse(null)}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Edit Course Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Title</label>
              <Input
                value={editingCourse?.title || ""}
                onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                className="w-full min-h-[100px] p-3 rounded-xl bg-secondary/30 border border-border/40 text-sm"
                value={editingCourse?.description || ""}
                onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCourse(null)}>Cancel</Button>
            <Button className="gradient-primary" onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Modules Dialog */}
      <Dialog open={!!managingModules} onOpenChange={(open) => !open && setManagingModules(null)}>
        <DialogContent className="glass-card sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black italic">Manage Modules: {managingModules?.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Add New Module Form */}
            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Add New Sequence</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Title</label>
                  <Input
                    placeholder="Module Title"
                    value={newModule.title}
                    onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                    className="h-10 text-sm bg-background/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Video Link (YT)</label>
                  <Input
                    placeholder="https://youtube.com/..."
                    value={newModule.videoEmbedLink}
                    onChange={(e) => setNewModule({ ...newModule, videoEmbedLink: e.target.value })}
                    className="h-10 text-sm bg-background/50"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Description</label>
                <Input
                  placeholder="Optional details..."
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  className="h-10 text-sm bg-background/50"
                />
              </div>
              <Button onClick={handleAddModule} disabled={isAddingModule} className="w-full h-10 gradient-primary text-xs font-black uppercase">
                {isAddingModule ? "Syncing..." : "Add Module to course"}
              </Button>
            </div>

            {/* Modules List */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Current Neural Paths</h4>
              {modules.length > 0 ? (
                modules.map((m, idx) => (
                  <div key={m._id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/10 border border-border/40 hover:bg-secondary/20 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{m.title}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">{m.videoEmbedLink ? "Video Attached" : "No Video"}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteModule(m._id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center border-dashed border-2 rounded-2xl text-muted-foreground text-xs italic">
                  No modules synchronized yet.
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setManagingModules(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      api.get(`/groups/mentor/${user._id}`)
        .then(res => setGroups(res.data.data))
        .finally(() => setLoading(false));
    }
  }, [user?._id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">My Groups</h2>
        <Button size="sm" className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" />Add New Group</Button>
      </div>
      <div className="space-y-4">
        {loading ? (
          <div className="glass-card p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : groups && groups.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <StudyGroupCard
                key={g._id}
                name={g.groupName}
                course={g.courseId?.title || "Course"}
                mentor="You"
                studentsCount={g.students?.length}
              />
            ))}
          </div>
        ) : (
          <div className="glass-card p-12 text-center text-muted-foreground">No groups found</div>
        )}
      </div>
    </div>
  );
}

function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentsAndProgress = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const [groupsRes, progressRes] = await Promise.all([
          api.get(`/groups/mentor/${user._id}`),
          api.get(`/progress/mentor/overview`)
        ]);

        const progressMap = new Map();
        progressRes.data.data?.forEach((p: any) => {
          progressMap.set(`${p.studentId?._id}-${p.courseId?._id}`, p.progressPercentage);
        });

        const allStudents: any[] = [];
        groupsRes.data.data?.forEach((g: any) => {
          g.students?.forEach((s: any) => {
            if (s && typeof s === 'object' && !allStudents.find(x => x._id === s._id && x.courseId === g.courseId?._id)) {
              allStudents.push({
                ...s,
                course: g.courseId?.title || "Course",
                courseId: g.courseId?._id,
                groupId: g._id,
                groupName: g.groupName,
                progress: progressMap.get(`${s._id}-${g.courseId?._id}`) || 0
              });
            }
          });
        });
        setStudents(allStudents);
      } catch (err) {
        console.error("Error fetching students and progress:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentsAndProgress();
  }, [user?._id]);

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.course?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-foreground">My Students</h2>
        <div className="relative w-full md:w-64">
          <Input
            placeholder="Search students..."
            className="pl-10 h-10 bg-secondary/20 border-border/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Users className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((s, i) => (
            <motion.div
              key={s._id}
              className="group relative glass-card p-6 overflow-hidden border-primary/10 hover:border-primary/40 transition-all duration-500"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-primary/10 transition-colors" />

              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <span className="text-xl font-black text-primary italic">{s.name ? s.name[0] : "?"}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-foreground truncate leading-tight group-hover:text-primary transition-colors">{s.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Primary Course</span>
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-[9px] border-primary/20 text-primary uppercase font-bold px-1.5 h-4">
                      {s.groupName}
                    </Badge>
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate border-l-2 border-primary/30 pl-3 py-0.5">
                    {s.course}
                  </p>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Mastery Level</span>
                    <span className="text-[10px] font-black text-primary">{s.progress}%</span>
                  </div>
                  <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-full transition-all duration-1000"
                      style={{ width: `${s.progress}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <Badge className="bg-green-500/10 text-green-500 border-none text-[8px] font-black uppercase tracking-widest">Enrolled Member</Badge>
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest hover:text-primary hover:bg-primary/5" onClick={() => window.location.href = `mailto:${s.email}`}>
                    Email Student <LinkIcon className="w-3 h-3 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center text-muted-foreground border-dashed">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-10" />
          <h3 className="text-xl font-bold text-foreground mb-1">No study partners found</h3>
          <p className="text-sm">Try adjusting your search or check again later.</p>
        </div>
      )}
    </div>
  );
}

function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newResource, setNewResource] = useState({ title: "", fileUrl: "", groupId: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchResources = async () => {
    try {
      const res = await api.get("/resources/mentor");
      setResources(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get(`/groups/mentor/${user?._id}`);
      setGroups(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchResources();
    fetchGroups();
  }, [user?._id]);

  const handleAddResource = async () => {
    if (!newResource.title || (!newResource.fileUrl && !selectedFile) || !newResource.groupId) {
      return toast.error("Please fill all fields and provide a file or link");
    }
    try {
      setIsAdding(true);

      const formData = new FormData();
      formData.append("title", newResource.title);
      formData.append("groupId", newResource.groupId);

      if (selectedFile) {
        formData.append("file", selectedFile);
      } else {
        formData.append("fileUrl", newResource.fileUrl);
      }

      await api.post("/resources", formData);

      toast.success("Resource shared successfully!");
      setNewResource({ title: "", fileUrl: "", groupId: "" });
      setSelectedFile(null);
      fetchResources();
    } catch (err: any) {
      console.error("Resource Upload Error:", err);
      const msg = err.response?.data?.message || "Failed to share resource";
      toast.error(msg);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this resource? This cannot be undone.")) return;
    try {
      await api.delete(`/resources/${id}`);
      toast.success("Resource node removed successfully");
      fetchResources();
    } catch (err) {
      toast.error("Failed to delete resource");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <FolderOpen className="w-7 h-7 text-primary" />
          Knowledge Repository
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground btn-glow px-6 font-bold uppercase tracking-widest text-xs h-11">
              <Plus className="w-4 h-4 mr-2" /> Share Node
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-black italic tracking-tight">Sync New Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Resource Meta Title</label>
                <Input
                  className="bg-secondary/20 border-border/60 h-12"
                  placeholder="e.g. Masterclass Lecture 01"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Upload File</label>
                    <Input
                      type="file"
                      className="bg-secondary/20 border-border/60 h-12 pt-2.5"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setSelectedFile(e.target.files[0]);
                          setNewResource({ ...newResource, fileUrl: "" });
                        }
                      }}
                    />
                  </div>
                  <div className="pt-6 font-bold text-muted-foreground">OR</div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">External Data Link</label>
                    <Input
                      className="bg-secondary/20 border-border/60 h-12"
                      placeholder="Paste Drive or GitHub URL..."
                      disabled={!!selectedFile}
                      value={newResource.fileUrl}
                      onChange={(e) => setNewResource({ ...newResource, fileUrl: e.target.value })}
                    />
                  </div>
                </div>
                {selectedFile && (
                  <p className="text-[10px] text-primary font-bold italic">📂 {selectedFile.name} selected for upload</p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Study Group</label>
                <Select onValueChange={(val) => setNewResource({ ...newResource, groupId: val })}>
                  <SelectTrigger className="bg-secondary/20 border-border/60 h-12">
                    <SelectValue placeholder="Broadcast to which group?" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.map(g => (
                      <SelectItem key={g._id} value={g._id}>{g.groupName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddResource} disabled={isAdding} className="w-full h-12 gradient-primary font-bold uppercase tracking-[0.2em] text-xs">
                {isAdding ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Initiate Sync"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="h-60 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res, i) => (
            <motion.div
              key={res._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ borderColor: "rgba(var(--accent), 0.4)" }}
              transition={{ duration: 0.3 }}
              className="group relative glass-card p-6 border-primary/10 hover:border-primary/40 transition-colors duration-500"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                    <FolderOpen className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-[9px] border-primary/20 text-primary font-black uppercase tracking-widest px-1.5 h-4">
                    {res.groupId?.groupName || "Public Node"}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors truncate">{res.title}</h4>
                  <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Sync Date: {new Date(res.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-9 bg-secondary/30 text-[10px] font-bold uppercase tracking-widest hover:bg-primary/5 hover:text-primary border border-border/40"
                    onClick={() => window.open(res.fileUrl, '_blank')}
                  >
                    <Download className="w-3.5 h-3.5 mr-2" /> Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-9 h-9 rounded-xl border border-border/40 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors"
                    onClick={() => handleDeleteResource(res._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-32 text-center text-muted-foreground border-dashed bg-gradient-to-b from-transparent to-primary/5">
          <FolderOpen className="w-20 h-20 mx-auto mb-6 opacity-10" />
          <h3 className="text-xl font-bold text-foreground mb-2 italic">The Knowledge Node is empty</h3>
          <p className="text-sm max-w-sm mx-auto mb-8 opacity-70">Empower your students by sharing high-quality resources, lecture notes, and study guides.</p>
          <Button variant="link" className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">Initialize First Node Sync</Button>
        </div>
      )}
    </div>
  );
}

function RequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    setLoading(true);
    api.get("/enrollments/mentor")
      .then(res => setRequests(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/enrollments/${id}`, { status });
      toast.success(`Request ${status}`);
      fetchRequests();
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Enrollment Requests</h2>
      {loading ? (
        <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : Array.isArray(requests) && requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req._id} className="glass-card p-6 flex items-center justify-between border-primary/20 hover:border-primary/40 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                  {req.studentId?.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">{req.studentId?.name}</h4>
                  <p className="text-xs text-muted-foreground mb-1">{req.studentId?.email}</p>
                  <p className="text-[10px] font-bold text-primary uppercase">Course: {req.courseId?.title}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white shadow-lg btn-glow rounded-xl font-black uppercase text-[10px] h-9 px-4"
                  onClick={() => handleAction(req._id, 'approved')}
                >
                  <Check className="w-4 h-4 mr-1.5" /> Authorize
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive/30 text-destructive hover:bg-destructive/10 rounded-xl font-black uppercase text-[10px] h-9 px-4"
                  onClick={() => handleAction(req._id, 'rejected')}
                >
                  <X className="w-4 h-4 mr-1.5" /> Dismiss
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center text-muted-foreground">
          <Clock className="w-12 h-12 mx-auto mb-4 opacity-10" />
          <p>No pending enrollment requests.</p>
        </div>
      )}
    </div>
  );
}

function PerformancePage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [newReminder, setNewReminder] = useState({ message: "", reminderTime: "" });
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const [groupsRes, progressRes] = await Promise.all([
          api.get(`/groups/mentor/${user._id}`),
          api.get(`/progress/mentor/overview`)
        ]);

        const progressMap = new Map();
        progressRes.data.data?.forEach((p: any) => {
          progressMap.set(`${p.studentId?._id}-${p.courseId?._id}`, {
            percentage: p.progressPercentage,
            completed: p.completedModules?.length || 0
          });
        });

        const allStudents: any[] = [];
        groupsRes.data.data?.forEach((g: any) => {
          g.students?.forEach((s: any) => {
            if (s && typeof s === 'object' && !allStudents.find(x => x._id === s._id && x.courseId === g.courseId?._id)) {
              const prog = progressMap.get(`${s._id}-${g.courseId?._id}`);
              allStudents.push({
                ...s,
                course: g.courseId?.title || "Course",
                courseId: g.courseId?._id,
                groupName: g.groupName,
                progress: prog ? prog.percentage : 0,
                completedModulesCount: prog ? prog.completed : 0
              });
            }
          });
        });
        setStudents(allStudents);
      } catch (err) {
        console.error("Error fetching performance data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?._id]);

  const handleAssignReminder = async () => {
    if (!newReminder.message || !newReminder.reminderTime) return toast.error("Please configure all focus parameters.");
    try {
      setIsAssigning(true);
      await api.post("/reminders", {
        ...newReminder,
        studentId: selectedStudent._id,
        courseId: selectedStudent.courseId
      });
      toast.success(`Broadcasting focus node to ${selectedStudent.name}... Synchronized!`);
      setSelectedStudent(null);
      setNewReminder({ message: "", reminderTime: "" });
    } catch (err) {
      toast.error("Interruption in neural link. Sync failed.");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Global Mastery Matrix</h2>
          <p className="text-xs text-muted-foreground mt-1 underline decoration-primary/30">Tracking student neural synchronization across all domains.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-full border border-primary/10">
          <Target className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">{students.length} Active Nodes</span>
        </div>
      </div>

      {loading ? (
        <div className="h-60 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      ) : students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((p, i) => (
            <motion.div
              key={`${p._id}-${p.courseId}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ borderColor: "rgba(var(--primary), 0.4)" }}
              transition={{ delay: i * 0.05 }}
              className="group relative glass-card p-6 space-y-5 overflow-hidden border-primary/10 hover:border-primary/40 transition-colors duration-500"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-primary/10 transition-colors" />

              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary font-black text-xl italic group-hover:rotate-6 transition-transform">
                    {p.name ? p.name[0] : "?"}
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{p.name}</h4>
                    <p className="text-[10px] text-muted-foreground uppercase mt-0.5">{p.course}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[8px] font-black tracking-widest uppercase border-primary/20 bg-primary/5 text-primary px-2 h-5">
                  {p.groupName}
                </Badge>
              </div>

              <div className="space-y-2 relative z-10">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Neural Completion</span>
                  <span className="text-sm font-black text-primary italic">{p.progress}%</span>
                </div>
                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full gradient-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/40 flex justify-between items-center relative z-10">
                <div className="flex items-center gap-2 text-muted-foreground text-[10px]">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  <span className="font-bold uppercase">{p.completedModulesCount} Cycles Synced</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 rounded-xl border border-primary/10 hover:bg-primary/5 text-primary font-bold uppercase tracking-widest text-[9px]"
                      onClick={() => setSelectedStudent(p)}
                    >
                      <Brain className="w-3.5 h-3.5 mr-2" /> Assign Node
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-card sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black italic">Strategic Study Assignment</DialogTitle>
                    </DialogHeader>
                    {selectedStudent && (
                      <div className="space-y-5 py-4">
                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary italic">{selectedStudent.name[0]}</div>
                          <div>
                            <p className="text-xs font-bold text-foreground">Targeting Student: {selectedStudent.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{selectedStudent.course}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Focus Pulse Message</label>
                          <Input
                            className="bg-secondary/20 border-border/60 h-12"
                            placeholder="e.g. Mastering Advanced AI Architectures"
                            value={newReminder.message}
                            onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Strategic Sync Time</label>
                          <Input
                            className="bg-secondary/20 border-border/60 h-12"
                            type="datetime-local"
                            value={newReminder.reminderTime}
                            onChange={(e) => setNewReminder({ ...newReminder, reminderTime: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button
                        onClick={handleAssignReminder}
                        disabled={isAssigning}
                        className="w-full h-12 gradient-primary font-bold uppercase tracking-widest text-xs"
                      >
                        {isAssigning ? "Broadcasting..." : "Synchronize Focus Node"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center text-muted-foreground border-dashed border-2">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-10" />
          <h3 className="text-lg font-bold text-foreground mb-2 italic">Neural Matrix Empty</h3>
          <p className="text-sm max-w-xs mx-auto italic">No students are currently active in your synchronization groups.</p>
        </div>
      )}
    </div>
  );
}

function SupportPage() {
  const [report, setReport] = useState({ title: "", message: "" });
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report.title || !report.message) return toast.error("Please fill all fields");

    try {
      setIsSending(true);
      await api.post("/reports", report);
      toast.success("Query sent to Admin!", {
        description: "Your signal has been received in the Nexus."
      });
      setReport({ title: "", message: "" });
    } catch (err) {
      toast.error("Failed to dispatcher signal");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-foreground tracking-tight italic uppercase">Direct <span className="text-primary">Inquiry</span></h2>
        <p className="text-muted-foreground font-medium">Mentor-to-Admin direct encrypted link. State your directive or request.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-8 space-y-6"
        >
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-lg mb-4">
            <Send className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Initiate Direct Signal</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Report technical anomalies, request resource expansion, or seek administrative guidance for your course clusters.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Directive Subject</label>
              <Input
                placeholder="e.g. Server Latency in Modules"
                className="bg-secondary/30 h-12 rounded-xl border-border/40 focus:border-primary/50"
                value={report.title}
                onChange={(e) => setReport({ ...report, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Detailed Log</label>
              <textarea
                placeholder="Please provide the full context of your query..."
                className="w-full min-h-[150px] bg-secondary/30 p-4 rounded-xl border border-border/40 focus:border-primary/50 focus:outline-none text-sm resize-none"
                value={report.message}
                onChange={(e) => setReport({ ...report, message: e.target.value })}
              />
            </div>
            <Button className="w-full h-12 gradient-primary rounded-xl font-black uppercase tracking-[0.2em] text-[10px] btn-glow" disabled={isSending}>
              {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Dispatch Message"}
            </Button>
          </form>
        </motion.div>

        <div className="space-y-6">
          <div className="glass-card p-6 border-primary/20 bg-primary/5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Urgent Protocols</h4>
            <div className="space-y-3">
              {[
                "Cluster synchronization failures",
                "Advanced student analytics issues",
                "Resource file corruption",
                "Mentor credential updates"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/40 text-xs font-bold text-muted-foreground hover:text-primary transition-all cursor-pointer">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 border-accent/20">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground mb-4">Command Center Access</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-4 italic">
              "For immediate intervention during live sessions, use the direct admin override signal."
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5 text-primary">Priority 10</Badge>
              <Badge variant="outline" className="bg-secondary/50">Admin Link Active</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MentorDashboard() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<DashboardLayout navItems={navItems} role="mentor" title="Dashboard"><DashboardHome /></DashboardLayout>} />
      <Route path="/courses" element={<DashboardLayout navItems={navItems} role="mentor" title="My Courses"><CoursesPage /></DashboardLayout>} />
      <Route path="/courses/create" element={<DashboardLayout navItems={navItems} role="mentor" title="Initialize Course"><CreateCourse /></DashboardLayout>} />
      <Route path="/groups" element={<DashboardLayout navItems={navItems} role="mentor" title="Groups"><GroupsPage /></DashboardLayout>} />
      <Route path="/students" element={<DashboardLayout navItems={navItems} role="mentor" title="Students"><StudentsPage /></DashboardLayout>} />
      <Route path="/resources" element={<DashboardLayout navItems={navItems} role="mentor" title="Repository"><ResourcesPage /></DashboardLayout>} />
      <Route path="/requests" element={<DashboardLayout navItems={navItems} role="mentor" title="Enrollment Clusters"><RequestsPage /></DashboardLayout>} />
      <Route path="/performance" element={<DashboardLayout navItems={navItems} role="mentor" title="Performance Analytics"><PerformancePage /></DashboardLayout>} />
      <Route path="/support" element={<DashboardLayout navItems={navItems} role="mentor" title="Nexus Support"><SupportPage /></DashboardLayout>} />
    </Routes>
  );
}

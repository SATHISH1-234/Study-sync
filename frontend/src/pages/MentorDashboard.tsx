import { useNavigate, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import StudyGroupCard from "@/components/StudyGroupCard";
import CourseCard from "@/components/CourseCard";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, GraduationCap, FolderOpen, BarChart3, Clock, Loader2, Plus, BookOpen, Check, X
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
import { Link as LinkIcon, Download, Trash2 } from "lucide-react";
import CreateCourse from "./CreateCourse";

const navItems = [
  { label: "Dashboard", path: "/mentor", icon: LayoutDashboard },
  { label: "My Courses", path: "/mentor/courses", icon: BookOpen },
  { label: "Requests", path: "/mentor/requests", icon: Clock },
  { label: "Messages", path: "/chat", icon: Users },
  { label: "Students", path: "/mentor/students", icon: GraduationCap },
  { label: "Resources", path: "/mentor/resources", icon: FolderOpen },
  { label: "Performance", path: "/mentor/performance", icon: BarChart3 },
];

function DashboardHome() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ groups: 0, students: 0, courses: 0 });

  useEffect(() => {
    const fetchData = async () => {
      if (!user?._id) return;
      try {
        const [groupRes, courseRes] = await Promise.all([
          api.get(`/groups/mentor/${user._id}`),
          api.get(`/courses/mentor/${user._id}`)
        ]);

        setGroups(groupRes.data.data || []);
        setCourses(courseRes.data.data || []);

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
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Welcome, Mentor {user?.name}</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="My Courses" value={stats.courses} icon={BookOpen} />
        <StatCard title="Total Students" value={stats.students} icon={GraduationCap} color="accent" />
        <StatCard title="Active Groups" value={stats.groups} icon={Users} color="accent" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-3">My Active Groups</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.length > 0 ? (
            groups.map((g) => (
              <StudyGroupCard
                key={g._id}
                name={g.groupName}
                course={g.courseId?.title || "Course"}
                mentor="You"
                studentsCount={g.students?.length}
              />
            ))
          ) : (
            <div className="col-span-full glass-card p-12 text-center text-muted-foreground">
              No study groups created yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CoursesPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      api.get(`/courses/mentor/${user._id}`)
        .then(res => setCourses(res.data.data))
        .finally(() => setLoading(false));
    }
  }, [user?._id]);

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
      ) : courses && courses.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <CourseCard
              key={c._id}
              name={c.title}
              students={c.studentsCount}
              modules={c.modulesCount}
              mentor="You"
              onView={() => { }}
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>You haven't created any courses yet.</p>
        </div>
      )}
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
    if (user?._id) {
      api.get(`/groups/mentor/${user._id}`)
        .then(res => {
          const allStudents: any[] = [];
          res.data.data?.forEach((g: any) => {
            g.students?.forEach((s: any) => {
              if (s && typeof s === 'object' && !allStudents.find(x => x._id === s._id)) {
                allStudents.push({ ...s, course: g.courseId?.title || "Course", groupId: g._id, groupName: g.groupName });
              }
            });
          });
          setStudents(allStudents);
        })
        .finally(() => setLoading(false));
    }
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

                <div className="pt-2 flex items-center justify-between border-t border-border/40">
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-green-500/10 text-green-500 border-none text-[8px] font-black uppercase tracking-widest">Active Partner</Badge>
                  </div>
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
    if (!newResource.title || !newResource.fileUrl || !newResource.groupId) {
      return toast.error("Please fill all fields");
    }
    try {
      setIsAdding(true);
      await api.post("/resources", newResource);
      toast.success("Resource shared successfully!");
      setNewResource({ title: "", fileUrl: "", groupId: "" });
      fetchResources();
    } catch (err) {
      toast.error("Failed to share resource");
    } finally {
      setIsAdding(false);
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
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">External Data Link</label>
                <Input
                  className="bg-secondary/20 border-border/60 h-12"
                  placeholder="Paste Drive, Notion or GitHub URL..."
                  value={newResource.fileUrl}
                  onChange={(e) => setNewResource({ ...newResource, fileUrl: e.target.value })}
                />
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
              transition={{ delay: i * 0.05 }}
              className="group relative glass-card p-6 border-primary/10 hover:border-primary/40 transition-all duration-500"
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
                    onClick={() => toast.info("Delete node feature coming soon!")}
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
      ) : requests.length > 0 ? (
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
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  className="bg-green-500 hover:bg-green-600 text-white shadow-lg"
                  onClick={() => handleAction(req._id, 'approved')}
                >
                  <Check className="w-4 h-4 mr-1" /> Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                  onClick={() => handleAction(req._id, 'rejected')}
                >
                  <X className="w-4 h-4 mr-1" /> Reject
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
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/progress/mentor/overview")
      .then(res => setData(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Student Performance</h2>
      {loading ? (
        <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : data.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((p) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                  {p.studentId?.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-foreground leading-tight">{p.studentId?.name}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase">{p.courseId?.title}</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Course Completion</span>
                  <span className="text-primary font-bold">{p.progressPercentage}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full gradient-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                    style={{ width: `${p.progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/40 flex justify-between items-center text-[10px]">
                <span className="text-muted-foreground">{p.completedModules?.length} Modules Done</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary text-[9px] px-1.5 h-4">Active</Badge>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center text-muted-foreground">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>No student progress data available yet.</p>
        </div>
      )}
    </div>
  );
}

export default function MentorDashboard() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout navItems={navItems} role="mentor" title="Mentor Dashboard"><DashboardHome /></DashboardLayout>} />
      <Route path="/courses" element={<DashboardLayout navItems={navItems} role="mentor" title="My Courses"><CoursesPage /></DashboardLayout>} />
      <Route path="/courses/create" element={<CreateCourse />} />
      <Route path="/groups" element={<DashboardLayout navItems={navItems} role="mentor" title="My Groups"><GroupsPage /></DashboardLayout>} />
      <Route path="/students" element={<DashboardLayout navItems={navItems} role="mentor" title="Students"><StudentsPage /></DashboardLayout>} />
      <Route path="/resources" element={<DashboardLayout navItems={navItems} role="mentor" title="Resources"><ResourcesPage /></DashboardLayout>} />
      <Route path="/requests" element={<DashboardLayout navItems={navItems} role="mentor" title="Enrollment Requests"><RequestsPage /></DashboardLayout>} />
      <Route path="/performance" element={<DashboardLayout navItems={navItems} role="mentor" title="Performance"><PerformancePage /></DashboardLayout>} />
    </Routes>
  );
}

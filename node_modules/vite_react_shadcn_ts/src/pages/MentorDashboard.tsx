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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      api.get(`/groups/mentor/${user._id}`)
        .then(res => {
          const allStudents: any[] = [];
          res.data.data?.forEach((g: any) => {
            g.students?.forEach((s: any) => {
              if (s && typeof s === 'object' && !allStudents.find(x => x._id === s._id)) {
                allStudents.push({ ...s, course: g.courseId?.title || "Course" });
              }
            });
          });
          setStudents(allStudents);
        })
        .finally(() => setLoading(false));
    }
  }, [user?._id]);

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">My Students</h2>
      {students && students.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((s, i) => (
            <motion.div
              key={s._id}
              className="glass-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center mb-3 text-primary-foreground font-bold">
                {s.name ? s.name[0] : "?"}
              </div>
              <h3 className="font-semibold text-foreground text-sm">{s.name}</h3>
              <p className="text-xs text-muted-foreground mb-3">{s.email}</p>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Course: {s.course}</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center text-muted-foreground">
          No students enrolled in your groups yet.
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
        <h2 className="text-2xl font-bold text-foreground">Resources</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-primary-foreground btn-glow">
              <Plus className="w-4 h-4 mr-2" /> Share Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Share New Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Resource Title</label>
                <Input
                  placeholder="e.g. Week 1 Lecture Slides"
                  value={newResource.title}
                  onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">File/Link URL</label>
                <Input
                  placeholder="Paste URL here..."
                  value={newResource.fileUrl}
                  onChange={(e) => setNewResource({ ...newResource, fileUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Group</label>
                <Select onValueChange={(val) => setNewResource({ ...newResource, groupId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Which group should see this?" />
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
              <Button onClick={handleAddResource} disabled={isAdding} className="w-full gradient-primary">
                {isAdding ? "Sharing..." : "Share with Group"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => (
            <motion.div
              key={res._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-4 hover:border-primary/40 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FolderOpen className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="outline" className="text-[10px]">{res.groupId?.groupName}</Badge>
              </div>
              <h4 className="font-bold text-foreground mb-1 truncate">{res.title}</h4>
              <p className="text-xs text-muted-foreground mb-4">Shared on {new Date(res.createdAt).toLocaleDateString()}</p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs h-8"
                  onClick={() => window.open(res.fileUrl, '_blank')}
                >
                  <LinkIcon className="w-3 h-3 mr-1" /> View
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center text-muted-foreground">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
          <p>You haven't shared any resources yet.</p>
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

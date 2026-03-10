import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import CourseCard from "@/components/CourseCard";
import StudyGroupCard from "@/components/StudyGroupCard";
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, BarChart3,
  UserCheck, Plus, Loader2, Trash2, MessageSquare, Send, CheckCircle, Clock, AlertCircle, Trash, Zap, Cloud
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import api from "@/utils/api";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { Megaphone } from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { label: "Courses", path: "/admin/courses", icon: BookOpen },
  { label: "Mentors", path: "/admin/mentors", icon: UserCheck },
  { label: "Students", path: "/admin/students", icon: GraduationCap },
  { label: "Study Groups", path: "/admin/groups", icon: Users },
  { label: "Reports", path: "/admin/reports", icon: MessageSquare },
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
];

function DashboardHome() {
  const [stats, setStats] = useState({ courses: 0, students: 0, mentors: 0, groups: 0 });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [courseRes, studentsRes, mentorsRes, groupsRes] = await Promise.all([
          api.get("/courses"),
          api.get("/auth/users?role=student"),
          api.get("/auth/users?role=mentor"),
          api.get("/groups")
        ]);

        setRecentCourses(courseRes.data.data.slice(0, 4));
        setStats({
          courses: courseRes.data.count,
          students: studentsRes.data.count,
          mentors: mentorsRes.data.count,
          groups: groupsRes.data.count || 0
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({ title: "", message: "", role: "all", type: "info" });

  const handleBroadcast = async () => {
    if (!broadcastForm.title || !broadcastForm.message) return toast.error("Please fill all fields");
    try {
      setIsBroadcasting(true);
      await api.post("/notifications/broadcast", broadcastForm);
      toast.success("Broadcast sent successfully!");
      setBroadcastForm({ title: "", message: "", role: "all", type: "info" });
    } catch (err) {
      toast.error("Failed to broadcast");
    } finally {
      setIsBroadcasting(false);
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Admin Overview</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
              <Megaphone className="w-4 h-4 mr-2" /> Broadcast Notify
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card shadow-2xl border-border/40">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-primary" />
                Broadcast Notification
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Audience</label>
                <Select value={broadcastForm.role} onValueChange={(val) => setBroadcastForm({ ...broadcastForm, role: val })}>
                  <SelectTrigger className="bg-secondary/30">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="mentor">Mentors Only</SelectItem>
                    <SelectItem value="student">Students Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="e.g. New Update Available"
                  className="bg-secondary/30"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Enter notification details..."
                  className="bg-secondary/30 min-h-[100px]"
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                className="gradient-primary w-full shadow-lg btn-glow"
                onClick={handleBroadcast}
                disabled={isBroadcasting}
              >
                {isBroadcasting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Send Notification"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Courses" value={stats.courses} icon={BookOpen} trend="+2 this month" />
        <StatCard title="Total Students" value={stats.students} icon={GraduationCap} trend="+18 this week" />
        <StatCard title="Total Mentors" value={stats.mentors} icon={UserCheck} color="accent" />
        <StatCard title="Active Groups" value={stats.groups} icon={Users} color="accent" trend="+3 this month" />
      </div>
      <div>
        <h3 className="font-semibold text-foreground mb-3">Recent Courses</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentCourses.map((c) => (
            <CourseCard
              key={c._id}
              name={c.title}
              students={c.studentsCount}
              modules={c.modulesCount}
              mentor={c.mentorId?.name || "Expert"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function CoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = () => {
    setLoading(true);
    api.get("/courses")
      .then(res => setCourses(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure? This will delete the course, group, and all modules.")) return;
    try {
      await api.delete(`/courses/${id}`);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (err) {
      toast.error("Failed to delete course");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Courses Management</h2>
        <Button className="gradient-primary text-primary-foreground btn-glow"><Plus className="w-4 h-4 mr-2" />Add Course</Button>
      </div>
      {loading ? (
        <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <div key={c._id} className="relative group">
              <CourseCard
                name={c.title}
                students={c.studentsCount}
                modules={c.modulesCount}
                mentor={c.mentorId?.name || "Mentor"}
                onView={() => { }}
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 text-[10px]"
                onClick={() => handleDelete(c._id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UserManagementPage({ role, title, icon: Icon }: { role: string, title: string, icon: any }) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    api.get(`/auth/users?role=${role}`)
      .then(res => setUsers(res.data.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const handleDelete = async (id: string) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}?`)) return;
    try {
      await api.delete(`/auth/users/${id}`);
      toast.success(`${title} account deleted`);
      fetchUsers();
    } catch (err) {
      toast.error(`Failed to delete ${role}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{title} Management</h2>
        <Button className="gradient-primary text-primary-foreground btn-glow"><Plus className="w-4 h-4 mr-2" />Add {title}</Button>
      </div>
      {loading ? (
        <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div key={u._id} className="glass-card p-4 flex items-center gap-4 relative group hover:border-primary/40 transition-all">
              <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-md">
                {u.profileImage ? <img src={u.profileImage} className="w-full h-full rounded-xl object-cover" /> : u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-foreground truncate">{u.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[10px] h-5 bg-secondary/50">{u.district || "Default"}</Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleDelete(u._id)}
              >
                <Plus className="rotate-45" />
              </Button>
            </div>
          ))}
          {users.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground glass-card">
              <Icon className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No {role}s found in the system.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MentorsPage() {
  return <UserManagementPage role="mentor" title="Mentor" icon={UserCheck} />;
}

function StudentsPage() {
  return <UserManagementPage role="student" title="Student" icon={GraduationCap} />;
}

function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await api.get("/groups");
      setGroups(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this group permanently?")) return;
    try {
      await api.delete(`/groups/${id}`);
      toast.success("Group deleted");
      fetchGroups();
    } catch (err) {
      toast.error("Failed to delete group");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Study Groups</h2>
      </div>
      {loading ? (
        <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((g) => (
            <div key={g._id} className="glass-card p-5 group relative overflow-hidden">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-sm truncate max-w-[150px]">{g.groupName}</h4>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">Members: {g.students?.length || 0}</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <p className="text-xs text-muted-foreground">Course: <span className="text-foreground font-semibold">{g.courseId?.title || "Unknown"}</span></p>
                <p className="text-xs text-muted-foreground">Mentor: <span className="text-foreground font-semibold">{g.mentorId?.name || "Unassigned"}</span></p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="w-full h-8 text-[10px] uppercase font-bold opacity-0 group-hover:opacity-100 transition-all"
                onClick={() => handleDelete(g._id)}
              >
                Terminate Group
              </Button>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground glass-card">
              <Users className="w-12 h-12 mx-auto mb-4 text-primary/30" />
              <p>No active study groups found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports");
      setReports(res.data.data);
    } catch (err) {
      toast.error("Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResponse = async () => {
    if (!reply) return toast.error("Please enter a response");
    try {
      await api.put(`/reports/${selectedReport._id}`, { reply });
      toast.success("Response sent to user!");
      setSelectedReport(null);
      setReply("");
      fetchReports();
    } catch (err) {
      toast.error("Failed to send response");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this report?")) return;
    try {
      await api.delete(`/reports/${id}`);
      toast.success("Report deleted");
      fetchReports();
    } catch (err) {
      toast.error("Failed to delete report");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Student & Mentor Reports</h2>
      {loading ? (
        <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reports.map((r) => (
            <div key={r._id} className={`glass-card p-5 border-l-4 ${r.status === 'resolved' ? 'border-l-green-500' : 'border-l-yellow-500'} group`}>
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 ${r.status === 'resolved' ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-yellow-500/10 text-yellow-600 border-yellow-200'}`}>
                  {r.status}
                </Badge>
                <span className="text-[10px] text-muted-foreground font-bold">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <h4 className="font-bold text-foreground mb-1">{r.title}</h4>
              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{r.message}</p>

              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {r.sender?.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-foreground truncate">{r.sender?.name}</p>
                  <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">{r.sender?.role} • {r.sender?.email}</p>
                </div>
              </div>

              {r.reply && (
                <div className="bg-secondary/30 p-3 rounded-xl border border-border/40 mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3" /> Admin Response
                  </p>
                  <p className="text-xs italic text-muted-foreground">"{r.reply}"</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                {r.status !== 'resolved' && (
                  <Dialog open={selectedReport?._id === r._id} onOpenChange={(open) => setSelectedReport(open ? r : null)}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="flex-1 gradient-primary text-[10px] font-bold h-9">
                        <Send className="w-3.5 h-3.5 mr-2" /> Respond
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card shadow-2xl border-border/40">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-primary" />
                          Respond to Query
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="p-4 rounded-2xl bg-secondary/20 border border-border/40">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">User Query</p>
                          <p className="text-sm font-medium italic text-foreground">"{r.message}"</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Your Response</label>
                          <Textarea
                            placeholder="Enter your resolution message..."
                            className="bg-secondary/30 min-h-[120px]"
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button className="gradient-primary w-full shadow-lg h-11" onClick={handleResponse}>
                          Send Resolution
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10 h-9 w-9"
                  onClick={() => handleDelete(r._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {reports.length === 0 && (
            <div className="col-span-full py-20 text-center text-muted-foreground glass-card border-dashed">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="text-sm font-medium">No active reports or queries found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AnalyticsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses")
      .then(res => setCourses(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Platform Analytics</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-bold text-foreground mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Course Enrollment Distribution
          </h3>
          <div className="space-y-6">
            {courses.map(c => (
              <div key={c._id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">{c.title}</span>
                  <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{c.studentsCount} Students</span>
                </div>
                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden border border-border/40">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (c.studentsCount / 20) * 100)}%` }} // Assuming 20 is max for demo
                    className="h-full gradient-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 bg-primary/5">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4">Platform Health</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-600">
                    <Zap className="w-4 h-4 shadow-sm" />
                  </div>
                  <span className="text-xs font-bold">Latency</span>
                </div>
                <span className="text-[10px] font-black text-green-600">24ms (Optimal)</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/50 border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-600">
                    <Cloud className="w-4 h-4 shadow-sm" />
                  </div>
                  <span className="text-xs font-bold">Database</span>
                </div>
                <span className="text-[10px] font-black text-blue-600">Connected</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-foreground mb-4">Neural Nodes</h4>
            <p className="text-[10px] text-muted-foreground font-medium mb-4 leading-relaxed">
              Total system agents active and monitoring cross-platform interactions.
            </p>
            <div className="flex items-center -space-x-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-secondary/80 overflow-hidden ring-2 ring-primary/5">
                  <img src={`https://i.pravatar.cc/100?u=${i * 20}`} />
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-white">
                +12
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout navItems={navItems} role="admin" title="Admin Dashboard"><DashboardHome /></DashboardLayout>} />
      <Route path="/courses" element={<DashboardLayout navItems={navItems} role="admin" title="Courses"><CoursesPage /></DashboardLayout>} />
      <Route path="/mentors" element={<DashboardLayout navItems={navItems} role="admin" title="Mentors"><MentorsPage /></DashboardLayout>} />
      <Route path="/students" element={<DashboardLayout navItems={navItems} role="admin" title="Students"><StudentsPage /></DashboardLayout>} />
      <Route path="/groups" element={<DashboardLayout navItems={navItems} role="admin" title="Study Groups"><GroupsPage /></DashboardLayout>} />
      <Route path="/reports" element={<DashboardLayout navItems={navItems} role="admin" title="Direct Reports"><ReportsPage /></DashboardLayout>} />
      <Route path="/analytics" element={<DashboardLayout navItems={navItems} role="admin" title="Platform Analytics"><AnalyticsPage /></DashboardLayout>} />
    </Routes>
  );
}

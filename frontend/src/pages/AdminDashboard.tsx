import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import CourseCard from "@/components/CourseCard";
import StudyGroupCard from "@/components/StudyGroupCard";
import {
  LayoutDashboard, BookOpen, Users, GraduationCap, BarChart3,
  UserCheck, Plus, Loader2, Trash2
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
  { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
];

function DashboardHome() {
  const [stats, setStats] = useState({ courses: 0, students: 0, mentors: 0, groups: 0 });
  const [recentCourses, setRecentCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [courseRes, studentsRes, mentorsRes] = await Promise.all([
          api.get("/courses"),
          api.get("/auth/users?role=student"),
          api.get("/auth/users?role=mentor")
        ]);

        setRecentCourses(courseRes.data.data.slice(0, 4));
        setStats({
          courses: courseRes.data.count,
          students: studentsRes.data.count,
          mentors: mentorsRes.data.count,
          groups: 0
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Study Groups</h2>
        <Button className="gradient-primary text-primary-foreground btn-glow"><Plus className="w-4 h-4 mr-2" />Create Group</Button>
      </div>
      <div className="glass-card p-20 text-center text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-4 text-primary/30" />
        <p>Active study groups will be visible here.</p>
      </div>
    </div>
  );
}

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
      <div className="glass-card p-20 text-center text-muted-foreground">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-primary/30" />
        <h3 className="font-semibold text-foreground text-base mb-1">Coming Soon</h3>
        <p className="text-sm">Global platform usage analytics are being calculated.</p>
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
      <Route path="/analytics" element={<DashboardLayout navItems={navItems} role="admin" title="Analytics"><AnalyticsPage /></DashboardLayout>} />
    </Routes>
  );
}

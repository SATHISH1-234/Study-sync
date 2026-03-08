import { useNavigate, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/StatCard";
import CourseCard from "@/components/CourseCard";
import StudyGroupCard from "@/components/StudyGroupCard";
import { motion } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Users, Target, FolderOpen, Brain, BarChart3,
  Bell, Clock, Play, Pause, RotateCcw, Camera, CheckSquare, FileText, Loader2,
  ChevronRight, CheckCircle2, Award, GraduationCap, Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Calendar, PlusCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { toast } from "sonner";
import CourseDetails from "./CourseDetails";
import FocusMode from "@/components/FocusMode";

const navItems = [
  { label: "Dashboard", path: "/student", icon: LayoutDashboard },
  { label: "My Courses", path: "/student/courses", icon: BookOpen },
  { label: "Messages", path: "/chat", icon: Users },
  { label: "Focus Mode", path: "/student/focus", icon: Target },
  { label: "Resources", path: "/student/resources", icon: FolderOpen },
  { label: "AI Reminders", path: "/student/reminders", icon: Brain },
  { label: "Progress", path: "/student/progress", icon: BarChart3 },
];

function DashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ courses: 0, hours: 0, modules: 0 });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [courseRes, sessionRes, progressRes, reminderRes] = await Promise.all([
          api.get(`/groups/student/${user?._id}`),
          api.get('/sessions/student'),
          api.get('/progress/student/all'),
          api.get(`/reminders/${user?._id}`)
        ]);

        const enrolledCourses = courseRes.data.data || [];
        const sessions = sessionRes.data.data || [];
        const progressList = progressRes.data.data || [];

        setCourses(enrolledCourses.map((g: any) => g.courseId).filter(Boolean).slice(0, 3));
        setReminders(reminderRes.data.data || []);

        // Calculate total hours from sessions (duration is in minutes)
        const totalMinutes = sessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0);
        const totalHours = Math.round((totalMinutes / 60) * 10) / 10;

        // Calculate completed modules from all progress records
        const totalCompletedModules = progressList.reduce((acc: number, p: any) => acc + (p.completedModules?.length || 0), 0);

        setStats({
          courses: enrolledCourses.length,
          hours: totalHours,
          modules: totalCompletedModules
        });
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) fetchDashboardData();
  }, [user?._id]);

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Welcome back, {user?.name}! 👋</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Enrolled Courses" value={stats.courses} icon={BookOpen} />
        <StatCard title="Study Hours (Week)" value={stats.hours} icon={Clock} color="accent" />
        <StatCard title="Completed Modules" value={stats.modules} icon={CheckSquare} />
      </div>
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-foreground">My Courses</h3>
          <Button variant="link" className="text-primary text-xs h-auto p-0">View All</Button>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.length > 0 ? (
            courses.map((c) => (
              <CourseCard
                key={c._id}
                name={c.title}
                students={c.studentsCount}
                modules={c.modulesCount}
                mentor={c.mentorId?.name || "Expert Mentor"}
                progress={0}
                onView={() => navigate(`/student/courses/${c._id}`)}
              />
            ))
          ) : (
            <div className="col-span-full glass-card p-8 text-center text-muted-foreground">
              No courses enrolled yet.
            </div>
          )}
        </div>
      </div>
      <div className="glass-card p-6 border-primary/10 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-primary/10 transition-all duration-700" />
        <div className="flex justify-between items-center mb-5 relative z-10">
          <h3 className="font-bold text-foreground flex items-center gap-2.5 italic">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary" />
            </div>
            AI Insight: Study Nodes
          </h3>
          <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-black tracking-widest text-primary hover:bg-primary/5" onClick={() => navigate("/student/reminders")}>
            Full Schedule
          </Button>
        </div>
        <div className="space-y-3 relative z-10">
          {reminders.length > 0 ? (
            reminders.slice(0, 2).map((r) => (
              <div key={r._id} className="group/item flex items-center justify-between p-4 bg-secondary/20 hover:bg-secondary/40 rounded-2xl border border-border/40 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background/80 flex items-center justify-center text-primary shadow-sm group-hover/item:scale-110 transition-transform">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">{r.message}</p>
                    <p className="text-[10px] font-medium text-muted-foreground mt-0.5">
                      {new Date(r.reminderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {r.courseId?.title || "AI Priority"}
                    </p>
                  </div>
                </div>
                <Badge className="bg-primary/10 text-primary border-none text-[8px] font-black uppercase tracking-tighter">
                  Syncing
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-xs text-muted-foreground p-8 bg-secondary/10 rounded-2xl text-center italic border border-dashed border-border/60">
              Your AI timeline is currently clear.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/courses")
      .then(res => setCourses(res.data.data))
      .catch(err => toast.error("Could not fetch courses"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">All Courses</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.length > 0 ? (
          courses.map((c) => (
            <CourseCard
              key={c._id}
              name={c.title}
              students={c.studentsCount}
              modules={c.modulesCount}
              mentor={c.mentorId?.name || "Mentor"}
              actionLabel="Explore & Enroll"
              onAction={() => navigate(`/student/courses/${c._id}`)}
            />
          ))
        ) : (
          <div className="col-span-full glass-card p-12 text-center text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No courses available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GroupsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      api.get(`/groups/student/${user._id}`)
        .then(res => setGroups(res.data.data))
        .catch(err => console.log(err))
        .finally(() => setLoading(false));
    }
  }, [user?._id]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Study Groups</h2>
      <div className="space-y-4">
        {loading ? (
          <div className="glass-card p-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
        ) : groups.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(g => (
              <StudyGroupCard key={g._id} name={g.groupName} course={g.courseId?.title || "Course"} mentor={g.mentorId?.name || "Mentor"} studentsCount={g.students?.length} />
            ))}
          </div>
        ) : (
          <div className="glass-card p-8 text-center text-muted-foreground">
            You haven't joined any study groups yet.
          </div>
        )}
      </div>
    </div>
  );
}


function RemindersPage() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newReminder, setNewReminder] = useState({ courseId: "", reminderTime: "", message: "" });

  const fetchReminders = async () => {
    if (user?._id) {
      try {
        const res = await api.get(`/reminders/${user._id}`);
        setReminders(res.data.data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchCourses = async () => {
    try {
      // First, get enrollment status to find approved courses
      const enrollmentRes = await api.get('/groups/student/' + user?._id);
      const enrolledCourses = enrollmentRes.data.data?.map((g: any) => g.courseId).filter(Boolean) || [];

      // If no groups found, try direct enrollment requests that are approved
      if (enrolledCourses.length === 0) {
        const studentRes = await api.get('/courses');
        // This is a backup filter, ideally we use the groups endpoint
        setCourses(studentRes.data.data?.filter((c: any) => c.isEnrolled) || []);
      } else {
        setCourses(enrolledCourses);
      }
    } catch (err) {
      console.error("Error fetching student courses:", err);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchReminders();
      fetchCourses();
    }
  }, [user?._id]);

  const handleAddReminder = async () => {
    if (!newReminder.courseId || !newReminder.reminderTime || !newReminder.message) {
      return toast.error("Deployment Error: Missing configuration parameters. Please fill all fields.");
    }
    try {
      setIsAdding(true);
      await api.post("/reminders", newReminder);
      toast.success("Focus Node Initialized: AI Strategy synced with local timeline.");
      setNewReminder({ courseId: "", reminderTime: "", message: "" });
      fetchReminders();
    } catch (err) {
      toast.error("Network Latency: Failed to sync with AI node.");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" /> AI Study Reminders
        </h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gradient-primary btn-glow">
              <PlusCircle className="w-4 h-4 mr-2" /> Set Reminder
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>Set AI Study Reminder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Course</label>
                <Select onValueChange={(val) => setNewReminder({ ...newReminder, courseId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Which course to study?" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                      <SelectItem key={c._id} value={c._id}>{c.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reminder Message</label>
                <Input
                  placeholder="e.g. Time to finish Module 2!"
                  value={newReminder.message}
                  onChange={(e) => setNewReminder({ ...newReminder, message: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={newReminder.reminderTime}
                  onChange={(e) => setNewReminder({ ...newReminder, reminderTime: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddReminder} disabled={isAdding} className="w-full gradient-primary">
                {isAdding ? "Setting..." : "Schedule Session"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reminders.length > 0 ? (
          reminders.map((r, i) => (
            <motion.div
              key={r._id}
              className="group relative glass-card p-6 overflow-hidden border-primary/10 hover:border-primary/40 transition-all duration-500 flex flex-col h-full min-h-[220px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />

              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10 shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <Badge variant="outline" className="bg-primary/5 text-[10px] border-primary/20 text-primary font-bold tracking-wider uppercase">
                    AI Scheduled
                  </Badge>
                </div>

                <div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">
                    {r.courseId?.title || "General Study"}
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                    {r.message}
                  </h3>
                </div>

                <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl border border-border/40">
                  <div className="w-8 h-8 rounded-lg bg-background/50 flex items-center justify-center text-primary shadow-sm">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">Reminder Time</p>
                    <p className="text-xs font-semibold text-foreground">
                      {new Date(r.reminderTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex -space-x-1.5">
                    {[1, 2].map(x => (
                      <div key={x} className="w-5 h-5 rounded-full border-2 border-background bg-secondary shadow-sm" />
                    ))}
                    <div className="w-5 h-5 rounded-full border-2 border-background bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary italic">+AI</div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest hover:text-primary hover:bg-primary/5">
                    Modify <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-secondary to-background border border-border/40 flex items-center justify-center shadow-2xl">
                <Brain className="w-12 h-12 text-muted-foreground opacity-20" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-lg transform rotate-12">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No active study nodes found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto italic">
              "Efficiency is doing things right; effectiveness is doing the right things." Let AI help you schedule your next deep work session.
            </p>
            <Button variant="link" className="mt-4 text-primary font-bold uppercase tracking-widest text-[10px]">Initialize First Node</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function ResourcesPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/resources/student")
      .then(res => setResources(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Shared Resources</h2>
      {loading ? (
        <div className="h-40 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((res) => (
            <motion.div
              key={res._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5 hover:border-primary/40 transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground">
                  <FolderOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-foreground truncate">{res.title}</h4>
                  <p className="text-[10px] text-muted-foreground truncate">From: {res.uploadedBy?.name} • {res.groupId?.groupName}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-9 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
                onClick={() => window.open(res.fileUrl, '_blank')}
              >
                <LinkIcon className="w-3.5 h-3.5 mr-2" /> Open Resource
              </Button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center text-muted-foreground">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-primary/30" />
          <h3 className="font-semibold text-foreground text-base mb-1">No resources found</h3>
          <p className="text-sm">Join a study group to view shared resources.</p>
        </div>
      )}
    </div>
  );
}

function ProgressPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;
    api.get("/progress/student/all")
      .then(res => setProgressData(res.data.data || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user?._id]);

  if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">My Learning Progress</h2>
      {progressData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {progressData.map((p, i) => (
            <motion.div
              key={p._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6 space-y-4 hover:border-primary/40 transition-all cursor-pointer group"
              onClick={() => navigate(`/student/courses/${p.courseId?._id}`)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-foreground text-lg">{p.courseId?.title}</h3>
                  <p className="text-xs text-muted-foreground">{p.completedModules?.length} Modules Completed</p>
                </div>
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {p.progressPercentage}%
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="text-primary font-medium">{p.progressPercentage}%</span>
                </div>
                <div className="h-2 w-full bg-secondary/50 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${p.progressPercentage}%` }}
                    className="h-full gradient-primary"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center">
                    <CheckCircle2 className="w-3 h-3 text-primary" />
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="text-xs group-hover:text-primary transition-colors">
                  Continue Learning <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-20 text-center text-muted-foreground bg-gradient-to-br from-primary/5 to-accent/5">
          <Award className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="font-bold text-foreground text-xl mb-2">No Progress Yet</h3>
          <p className="max-w-md mx-auto mb-6 italic">You haven't started any courses. Enroll in a course and begin your learning journey to see your progress here!</p>
          <Button className="gradient-primary btn-glow" onClick={() => navigate("/student/courses")}>Explore Courses</Button>
        </div>
      )}
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout navItems={navItems} role="student" title="Student Dashboard"><DashboardHome /></DashboardLayout>} />
      <Route path="/courses" element={<DashboardLayout navItems={navItems} role="student" title="My Courses"><CoursesPage /></DashboardLayout>} />
      <Route path="/courses/:id" element={<CourseDetails />} />
      <Route path="/groups" element={<DashboardLayout navItems={navItems} role="student" title="Study Groups"><GroupsPage /></DashboardLayout>} />
      <Route path="/focus" element={<DashboardLayout navItems={navItems} role="student" title="Focus Mode"><FocusMode /></DashboardLayout>} />
      <Route path="/reminders" element={<DashboardLayout navItems={navItems} role="student" title="AI Reminders"><RemindersPage /></DashboardLayout>} />
      <Route path="/resources" element={<DashboardLayout navItems={navItems} role="student" title="Resources"><ResourcesPage /></DashboardLayout>} />
      <Route path="/progress" element={<DashboardLayout navItems={navItems} role="student" title="Progress"><ProgressPage /></DashboardLayout>} />
    </Routes>
  );
}

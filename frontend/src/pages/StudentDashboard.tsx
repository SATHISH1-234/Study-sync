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
      <div className="glass-card p-5">
        <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Bell className="w-4 h-4 text-primary" />AI Study Reminders</h3>
        <div className="space-y-2">
          {reminders.length > 0 ? (
            reminders.slice(0, 2).map((r) => (
              <div key={r._id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-foreground">{r.message}</p>
                  <p className="text-xs text-muted-foreground">{new Date(r.reminderTime).toLocaleString()}</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary">In Progress</span>
              </div>
            ))
          ) : (
            <div className="text-sm text-muted-foreground p-3 bg-secondary/10 rounded-xl">
              No upcoming reminders.
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

function FocusMode() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [running]);

  const handleEndSession = async () => {
    setRunning(false);
    try {
      await api.post("/sessions", {
        duration: Math.floor((25 * 60 - seconds) / 60) || 1,
        focusScore: 85,
        cameraActive: true
      });
      toast.success("Focus session recorded and added to your progress!");
      setSeconds(25 * 60);
    } catch (error) {
      console.error(error);
    }
  };

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = ((25 * 60 - seconds) / (25 * 60)) * 100;

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-8">
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5"><Camera className="w-4 h-4 text-primary" /> Webcam ON</span>
        <span>Deep Work Session</span>
      </div>

      <motion.div
        className="relative w-56 h-56 flex items-center justify-center"
        animate={running ? { boxShadow: ["0 0 0 0 hsl(230 80% 56% / 0.3)", "0 0 0 16px hsl(230 80% 56% / 0)", "0 0 0 0 hsl(230 80% 56% / 0.3)"] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ borderRadius: "50%" }}
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 224 224">
          <circle cx="112" cy="112" r="100" fill="none" stroke="hsl(var(--secondary))" strokeWidth="6" />
          <circle
            cx="112" cy="112" r="100" fill="none"
            stroke="url(#timerGradient)" strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 100}`}
            strokeDashoffset={`${2 * Math.PI * 100 * (1 - progress / 100)}`}
            className="transition-all duration-1000"
          />
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(230, 80%, 56%)" />
              <stop offset="100%" stopColor="hsl(270, 70%, 60%)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="text-center z-10">
          <span className="text-5xl font-bold text-foreground tabular-nums">
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <p className="text-xs text-muted-foreground mt-1">Focus Session</p>
        </div>
      </motion.div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => { setRunning(false); setSeconds(25 * 60); }}>
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button size="lg" className="gradient-primary text-primary-foreground btn-glow px-8" onClick={() => running ? handleEndSession() : setRunning(true)}>
          {running ? <><Pause className="w-4 h-4 mr-2" />Save & End</> : <><Play className="w-4 h-4 mr-2" />Start Session</>}
        </Button>
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
      const res = await api.get(`/groups/student/${user?._id}`);
      setCourses(res.data.data?.map((g: any) => g.courseId).filter(Boolean) || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReminders();
    fetchCourses();
  }, [user?._id]);

  const handleAddReminder = async () => {
    if (!newReminder.courseId || !newReminder.reminderTime || !newReminder.message) {
      return toast.error("Please fill all fields");
    }
    try {
      setIsAdding(true);
      await api.post("/reminders", newReminder);
      toast.success("AI Study Reminder set!");
      setNewReminder({ courseId: "", reminderTime: "", message: "" });
      fetchReminders();
    } catch (err) {
      toast.error("Failed to set reminder");
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reminders.length > 0 ? (
          reminders.map((r, i) => (
            <motion.div
              key={r._id}
              className="glass-card p-5 hover:border-primary/40 transition-all border border-primary/10 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse-soft">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold">
                  {r.courseId?.title}
                </div>
              </div>
              <h3 className="font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{r.message}</h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {new Date(r.reminderTime).toLocaleString()}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full glass-card p-12 text-center text-muted-foreground bg-gradient-to-b from-transparent to-primary/5">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="italic">No study reminders set yet. Let the AI help you stay on track!</p>
            <Button variant="link" className="mt-2 text-primary">Schedule your first session</Button>
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

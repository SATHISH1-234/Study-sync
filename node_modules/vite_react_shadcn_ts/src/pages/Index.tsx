import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Brain, Users, BookOpen, Target, Share2, Clock,
  GraduationCap, Sparkles, ArrowRight, ShieldCheck,
  Zap, Globe, Award, ChevronRight, Rocket
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRef } from "react";

const features = [
  {
    icon: Brain,
    title: "AI Study Reminders",
    desc: "Smart notifications that adapt to your study patterns and keep you on track.",
    gradient: "from-blue-500/20 to-purple-500/20"
  },
  {
    icon: Target,
    title: "Focus Mode",
    desc: "Distraction-free environment with focus tracking and productivity analytics.",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    icon: GraduationCap,
    title: "Expert Mentorship",
    desc: "Direct connection with industry-leading mentors for personalized guidance.",
    gradient: "from-orange-500/20 to-pink-500/20"
  },
  {
    icon: Users,
    title: "Dynamic Groups",
    desc: "Collaborate with peers in high-energy study groups with shared live whiteboards.",
    gradient: "from-cyan-500/20 to-blue-500/20"
  },
  {
    icon: Share2,
    title: "Resource Hub",
    desc: "A centralized vault for all your study materials, PDFs, and collaborative notes.",
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    icon: Award,
    title: "Path to Mastery",
    desc: "Gamified learning paths that turn your academic goals into achievable milestones.",
    gradient: "from-yellow-500/20 to-orange-500/20"
  },
];

const stats = [
  { label: "Active Students", value: "10K+", icon: Users },
  { label: "Expert Mentors", value: "500+", icon: GraduationCap },
  { label: "Study Resources", value: "25K+", icon: BookOpen },
  { label: "Improvement Rate", value: "94%", icon: Zap },
];

export default function Index() {
  const { user } = useAuth();
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  return (
    <div className="min-h-screen bg-background selection:bg-primary/30 scroll-smooth">
      {/* Premium Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-background/60 backdrop-blur-2xl">
        <div className="container mx-auto flex items-center justify-between h-20 px-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl text-foreground tracking-tighter leading-none italic">SIP WEB</span>
              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Innovation Academy</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#about" className="hover:text-primary transition-colors">Excellence</a>
            <a href="#community" className="hover:text-primary transition-colors">Community</a>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button className="gradient-primary btn-glow text-white font-bold px-6 h-11 rounded-xl shadow-xl hover:scale-105 active:scale-95 transition-all" asChild>
                <Link to={user.role === 'admin' ? '/admin' : user.role === 'mentor' ? '/mentor' : '/student'}>
                  Dashboard <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="font-bold text-sm uppercase tracking-widest hover:text-primary hidden sm:flex" asChild><Link to="/login">Login</Link></Button>
                <Button className="gradient-primary btn-glow text-white font-bold px-8 h-12 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all" asChild>
                  <Link to="/register">Join Platform</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section: The WOW Moment */}
      <section ref={targetRef} className="relative min-h-[100vh] flex items-center pt-20 overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] animate-pulse-soft" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[120px] animate-pulse-soft delay-1000" />
        </div>

        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div style={{ opacity, scale }}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em] mb-8"
            >
              <Sparkles className="w-4 h-4" /> The Future of Collaborative Learning
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-foreground"
            >
              Elevate Your <br />
              <span className="gradient-text italic">Learning.</span> <br />
              Master Your <br />
              <span className="text-primary italic underline decoration-accent/30 decoration-8 underline-offset-8">Future.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground max-w-lg mb-12 leading-relaxed font-medium"
            >
              The premium ecosystem for students and mentors. Real-time collaboration,
              AI-driven insights, and expert guidance combined in one powerful portal.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-wrap items-center gap-6"
            >
              <Button size="lg" className="gradient-primary btn-glow text-white font-black px-10 h-16 rounded-2xl text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all" asChild>
                <Link to="/register">Get Started Free <ChevronRight className="ml-2 w-6 h-6" /></Link>
              </Button>
              <div className="flex items-center gap-4 py-2 px-4 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-secondary/50 ring-2 ring-background overflow-hidden"><img src={`https://i.pravatar.cc/150?u=${i * 50}`} alt="user" /></div>)}
                </div>
                <div>
                  <p className="text-xs font-black text-foreground uppercase tracking-widest">Join 10,000+</p>
                  <p className="text-[10px] text-muted-foreground font-bold">Students already growing</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.4, type: "spring" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 rounded-full animate-float-slow" />
            <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_64px_128px_-16px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] transition-transform duration-700">
              <img src="/hero_student_collaboration_1772777511366.png" alt="Hero Interaction" className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background via-transparent to-transparent" />
            </div>

            {/* Floating Achievement Card */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-12 -right-6 md:-right-12 glass-card p-6 border border-white/20 shadow-2xl z-20 max-w-[200px]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">New Achievement</span>
              </div>
              <p className="text-xs font-bold leading-snug">Excellence in Collaboration</p>
              <div className="mt-3 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "85%" }}
                  transition={{ duration: 2, delay: 1 }}
                  className="h-full gradient-primary"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section id="about" className="py-20 bg-secondary/10 border-y border-border/40 relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-3xl font-black text-foreground mb-1">{stat.value}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features: The Bento Grid */}
      <section id="features" className="py-32 relative">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="text-center lg:text-left">
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground mb-6">
                Built for <span className="gradient-text italic">Performance.</span>
              </h2>
              <p className="text-lg text-muted-foreground font-medium max-w-2xl mx-auto lg:mx-0">
                Every tool within SIP WEB is engineered to remove friction
                and accelerate your mastery over complex subjects.
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="hidden lg:block aspect-video rounded-[2rem] overflow-hidden border border-border/40 shadow-2xl relative group"
            >
              <img src="/education_tech_grid_1772777532196.png" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Tech Grid" />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent" />
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                whileHover={{ y: -10 }}
                className={`group relative glass-card p-10 overflow-hidden border border-border/40 hover:border-primary/50 transition-all duration-500`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${f.gradient} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="w-16 h-16 rounded-[1.5rem] bg-secondary flex items-center justify-center mb-8 border border-border/40 group-hover:scale-110 group-hover:gradient-primary group-hover:text-white transition-all duration-500">
                  <f.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-foreground mb-4 group-hover:text-primary transition-colors tracking-tight">{f.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed mb-6">{f.desc}</p>
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  Learn more <ArrowRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Innovation Section: Collaboration Art */}
      <section id="community" className="py-32 bg-card/30 relative overflow-hidden h-[800px] flex items-center">
        <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full overflow-hidden z-0 opacity-40 lg:opacity-100">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 lg:via-background/20 to-transparent z-10" />
          <img src="/mentor_collaboration_art_1772777553846.png" alt="Community Art" className="w-full h-full object-cover scale-110 animate-pulse-soft" />
        </div>

        <div className="container mx-auto px-6">
          <div className="max-w-xl">
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-none mb-8"
            >
              Connect with the <br />
              <span className="gradient-text italic">Best Minds.</span>
            </motion.h2>
            <p className="text-xl text-muted-foreground font-medium mb-12">
              Join a vibrant community of lifelong learners. Get verified by mentors,
              compete in study sprints, and share knowledge globally.
            </p>

            <div className="space-y-6 mb-12">
              {[
                { title: "Direct Mentor Chat", desc: "Premium 1-on-1 access to experts." },
                { title: "Smart Study Groups", desc: "Collaborate with high-performers." },
                { title: "Resource Exchange", desc: "Voted and verified study materials." }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4 p-4 rounded-3xl bg-secondary/20 border border-border/20"
                >
                  <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-black text-foreground uppercase tracking-widest text-xs mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Button size="lg" className="gradient-primary btn-glow text-white font-black px-12 h-16 rounded-2xl shadow-2xl" asChild>
              <Link to="/register">Create Your Profile</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Ultimate CTA */}
      <section className="py-40 relative">
        <div className="container mx-auto px-6">
          <div className="relative glass-card p-16 md:p-24 text-center max-w-5xl mx-auto overflow-hidden border border-white/10 shadow-[0_64px_128px_-16px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-0 w-full h-full gradient-primary opacity-10 -z-10" />
            <div className="relative z-10 max-w-2xl mx-auto">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                className="w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center mx-auto mb-10 shadow-3xl animate-bounce-soft"
              >
                <Rocket className="w-10 h-10 text-white" />
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground mb-8">
                Ready to transcend <br />
                <span className="gradient-text italic">Traditional Learning?</span>
              </h2>
              <p className="text-lg text-muted-foreground font-semibold mb-12">
                Join the Student Improvement Portal today and experience the future of education.
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Button size="lg" className="gradient-primary btn-glow text-white font-black px-12 h-16 rounded-2xl text-lg shadow-2xl hover:scale-105 transition-all" asChild>
                  <Link to="/register">Start Your Journey <ArrowRight className="ml-2 w-6 h-6" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-border px-12 h-16 rounded-2xl text-lg font-black uppercase tracking-widest hover:bg-secondary/20 transition-all font-sans" asChild>
                  <Link to="/login">Member Login</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* High-End Footer */}
      <footer className="border-t border-border/40 py-20 bg-card">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12 mb-20">
          <div className="md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                <BookOpen className="w-7 h-7 text-primary-foreground" />
              </div>
              <span className="font-black text-2xl text-foreground tracking-tighter italic uppercase">SIP WEB</span>
            </Link>
            <p className="text-muted-foreground font-medium max-w-sm leading-relaxed">
              We are building the future of peer-to-peer education.
              Join a movement that empowers curiosity and rewards academic excellence.
            </p>
          </div>

          <div>
            <h5 className="font-black text-xs uppercase tracking-[0.2em] text-foreground mb-6">Platform</h5>
            <ul className="space-y-4 text-sm font-bold text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Courses</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Mentorship</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Resources</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Communities</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-black text-xs uppercase tracking-[0.2em] text-foreground mb-6">Connect</h5>
            <ul className="space-y-4 text-sm font-bold text-muted-foreground">
              <li><Link to="/login?role=admin" className="hover:text-primary transition-colors flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Admin Portal</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Discord</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto px-6 pt-12 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm font-bold text-muted-foreground tracking-wide italic">
            © 2026 SIP WEB. BUILT FOR EXCELLENCE.
          </p>
          <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-muted-foreground/60">
            <Link to="/login" className="hover:text-foreground italic">Privacy Policy</Link>
            <Link to="/login" className="hover:text-foreground italic">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

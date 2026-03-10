import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BookOpen, Mail, Lock, User, GraduationCap, Users,
  Loader2, ArrowLeft, Eye, EyeOff, Check, X,
  Sparkles, CheckCircle2, Globe, Laptop, Rocket
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import api from "@/utils/api";

const roles = [
  { value: "student", label: "Student", icon: GraduationCap, desc: "Access courses" },
  { value: "mentor", label: "Mentor", icon: Users, desc: "Coach students" },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const hasMinLength = password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    if (!hasMinLength) return;

    setIsLoading(true);
    try {
      const response = await api.post("/auth/register", { name, email, password, role });
      if (response.data.success) {
        login(response.data);
        toast.success("Welcome aboard!", {
          description: "Your account has been created successfully."
        });
        setTimeout(() => {
          if (role === 'mentor') navigate("/mentor");
          else navigate("/student");
        }, 1000);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed. The server might be waking up, please try again in a few seconds.";
      if (message.toLowerCase().includes("exists")) setEmailError("Account already exists with this email.");
      else toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-accent blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-primary blur-[150px]" />
      </div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 z-20"
      >
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full px-4 hover:bg-secondary/50 text-muted-foreground group transition-all"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Home
        </Button>
      </motion.div>

      <div className="w-full max-w-6xl grid lg:grid-cols-2 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden border border-border/40 bg-card/40 backdrop-blur-2xl m-4">
        {/* Left Pane: Info & Perks */}
        <div className="hidden lg:flex flex-col justify-between p-16 gradient-primary relative">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')] opacity-10" />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <span className="text-3xl font-black text-white tracking-tight italic">SIP WEB</span>
            </div>

            <h2 className="text-5xl font-black text-white leading-[1.1] mb-8">
              Start Your <br />
              <span className="text-white/80">Journey Here.</span>
            </h2>

            <div className="space-y-6">
              {[
                { icon: Globe, text: "Global learning community" },
                { icon: Laptop, text: "Interactive study lessons" },
                { icon: Rocket, text: "Accelerated career growth" }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-center gap-4 group"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/10 group-hover:bg-white/20 transition-all">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-white/90 font-semibold tracking-wide">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="relative z-10 mt-12 bg-white/10 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-primary bg-secondary/50 ring-2 ring-white/10 overflow-hidden shadow-lg"><img src={`https://i.pravatar.cc/150?u=${i * 10}`} alt="user" /></div>)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white tracking-wide">Join 5,000+ Students</p>
                <p className="text-[11px] text-white/70 font-medium">Already thriving with SIP Web</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Sign-up Form */}
        <div className="p-8 md:p-16 flex flex-col justify-center bg-card/60">
          <div className="max-w-md w-full mx-auto">
            <div className="text-center lg:text-left mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3" /> Get Started Now
              </div>
              <h1 className="text-4xl font-extrabold text-foreground tracking-tight">Create Account</h1>
              <p className="text-muted-foreground mt-3 font-medium">Be part of the future of education</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Role Selection Blocks */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Choose Your Role</Label>
                <div className="grid grid-cols-2 gap-4">
                  {roles.map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setRole(r.value)}
                      className={`relative overflow-hidden group p-4 rounded-2xl border-2 transition-all duration-300 text-left ${role === r.value
                        ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-lg"
                        : "border-border/60 bg-secondary/20 hover:border-primary/40 hover:bg-secondary/40"
                        }`}
                    >
                      <r.icon className={`w-8 h-8 mb-2 transition-transform duration-300 ${role === r.value ? 'text-primary scale-110' : 'text-muted-foreground'}`} />
                      <span className={`text-sm font-bold block mb-0.5 ${role === r.value ? 'text-primary' : 'text-foreground'}`}>{r.label}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{r.desc}</span>
                      {role === r.value && (
                        <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Full Name</Label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input id="name" placeholder="John Doe" className="pl-12 h-12 bg-secondary/30 border-border/60 rounded-xl focus-visible:ring-primary/20 font-medium" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@email.com"
                      className={`pl-12 h-12 bg-secondary/30 border-border/60 rounded-xl focus-visible:ring-primary/20 font-medium ${emailError ? "border-destructive focus-visible:ring-destructive" : ""}`}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Create Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 6 characters"
                    className="pl-12 pr-12 h-12 bg-secondary/30 border-border/60 rounded-xl focus-visible:ring-primary/20 font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-all"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[11px] font-bold tracking-wide mt-2 ${hasMinLength ? 'bg-green-500/10 text-green-600 border-green-200' : 'bg-secondary/40 text-muted-foreground border-border/60'}`}
                  >
                    {hasMinLength ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                    Minimum 6 characters
                  </motion.div>
                )}
              </div>

              {emailError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold text-center">
                  {emailError}
                </motion.div>
              )}

              <Button
                type="submit"
                className="w-full gradient-primary btn-glow text-white font-black h-14 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                disabled={isLoading || !hasMinLength}
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Complete Registration"}
              </Button>
            </form>

            <div className="mt-10 text-center">
              <p className="text-sm text-muted-foreground font-semibold">
                Already part of the community?{" "}
                <Link to="/login" className="text-primary hover:underline ml-1">Sign in here</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

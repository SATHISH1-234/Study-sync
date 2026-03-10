import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Mail, Lock, Loader2, ArrowLeft, Eye, EyeOff, ShieldCheck, Cpu, Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import api from "@/utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Advanced role detection for UI themes
  const queryParams = new URLSearchParams(location.search);
  const targetRole = queryParams.get('role');
  const isAdminView = targetRole === 'admin';
  const isMentorView = targetRole === 'mentor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      if (response.data.success) {
        login(response.data);
        toast.success("Welcome back!", {
          description: "Login successful. Redirecting to your dashboard..."
        });

        const role = response.data.role;
        setTimeout(() => {
          if (role === 'admin') navigate("/admin");
          else if (role === 'mentor') navigate("/mentor");
          else navigate("/student");
        }, 1000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Connection failed. The server might be waking up, please try again in a moment.", {
        style: { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent blur-[120px]" />
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
          Back to home
        </Button>
      </motion.div>

      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-0 shadow-2xl rounded-3xl overflow-hidden border border-border/40 bg-card/30 backdrop-blur-xl m-4">
        {/* Left Side: Illustration & Branding */}
        <div className="hidden lg:flex flex-col justify-between p-12 gradient-primary relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-12">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter italic">SIP Web</span>
            </div>

            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-white leading-tight">
                Unlock Your <br />
                <span className="text-white/80">Potential Today.</span>
              </h2>
              <p className="text-white/70 text-lg max-w-sm leading-relaxed">
                Experience the next generation of collaborative learning and academic growth.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white shadow-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <p className="text-xs text-white/80 font-medium">
              Enterprise-grade security and <br /> encrypted data protection.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-card/50 backdrop-blur-sm">
          <div className="max-w-md w-full mx-auto">
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-xl">
                <BookOpen className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>

            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center justify-center lg:justify-start gap-2">
                {isAdminView && <Cpu className="w-8 h-8 text-primary animate-pulse" />}
                {isMentorView && <Users className="w-8 h-8 text-accent animate-pulse" />}
                {!isAdminView && !isMentorView && <BookOpen className="w-8 h-8 text-primary" />}
                {isAdminView ? "Admin Login" : isMentorView ? "Mentor Portal" : "Login"}
              </h1>
              <p className="text-muted-foreground mt-2">
                {isAdminView
                  ? "Access the administrative control center"
                  : isMentorView
                    ? "Welcome back, Mentor. Access your teaching dashboard."
                    : "Enter your credentials to access your portal"}
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2 text-left">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={isAdminView ? "admin@sip.com" : "student@example.com"}
                    className="pl-12 h-12 bg-secondary/30 border-border/60 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all font-medium"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{isAdminView ? "Access Code" : "Password"}</Label>
                  <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-12 pr-12 h-12 bg-secondary/30 border-border/60 rounded-xl focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all font-medium"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary btn-glow text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isAdminView ? "Logging in..." : "Authenticating..."}</span>
                  </div>
                ) : (
                  isAdminView ? "Login as Admin" : "Login to Dashboard"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center bg-secondary/20 p-4 rounded-2xl border border-border/40">
              {isMentorView ? (
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Mentor Access Portal</p>
                  <Link to="/register" className="text-primary font-bold hover:underline block text-sm">Become a Mentor</Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-medium">
                  New to the platform?{" "}
                  <Link to="/register" className="text-primary font-bold hover:underline ml-1">Create an account</Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

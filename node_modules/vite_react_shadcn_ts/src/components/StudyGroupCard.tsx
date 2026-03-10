import { motion } from "framer-motion";
import { Users, BookOpen, ChevronRight } from "lucide-react";

interface StudyGroupCardProps {
  name: string;
  course: string;
  mentor: string;
  studentsCount: number;
  onClick?: () => void;
}

export default function StudyGroupCard({ name, course, mentor, studentsCount, onClick }: StudyGroupCardProps) {
  return (
    <motion.div
      className="glass-card p-6 flex flex-col group cursor-pointer relative overflow-hidden"
      whileHover={{ borderColor: "rgba(var(--primary), 0.4)" }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full -mr-12 -mt-12 blur-3xl group-hover:bg-accent/10 transition-colors" />

      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center border border-accent/20 group-hover:bg-accent/20 transition-colors">
          <Users className="w-6 h-6 text-accent" />
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map(x => (
            <div key={x} className={`w-1 h-3 rounded-full ${x <= 2 ? 'bg-accent' : 'bg-accent/30'}`} />
          ))}
        </div>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-accent transition-colors">{name}</h3>
      <div className="space-y-4 pt-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-muted-foreground truncate">{course}</span>
        </div>

        <div className="flex justify-between items-center border-t border-border/40 pt-4 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center text-[10px] font-black text-accent uppercase">
              {studentsCount}
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Syncs</span>
          </div>
          <motion.div
            className="w-8 h-8 rounded-full border border-accent/20 flex items-center justify-center text-accent opacity-0 group-hover:opacity-100 transition-all duration-500"
            whileHover={{ scale: 1.1 }}
          >
            <ChevronRight className="w-5 h-5" />
          </motion.div>
        </div>
      </div>
    </motion.div >
  );
}

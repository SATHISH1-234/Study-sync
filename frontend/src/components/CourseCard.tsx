import { motion } from "framer-motion";
import { BookOpen, Users, Layers, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CourseCardProps {
  name: string;
  students: number;
  modules: number;
  mentor?: string;
  progress?: number;
  onView?: () => void;
  onEdit?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export default function CourseCard({ name, students, modules, mentor, progress, onView, onEdit, actionLabel, onAction }: CourseCardProps) {
  return (
    <motion.div
      className="relative p-6 rounded-3xl border border-border bg-card shadow-lg flex flex-col group cursor-pointer"
      whileHover={{ borderColor: "rgba(var(--primary), 0.4)" }}
      transition={{ duration: 0.3 }}
      onClick={onView}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
          <BookOpen className="w-6 h-6 text-primary" />
        </div>
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
          >
            <Edit2 className="w-4.5 h-4.5" />
          </Button>
        )}
      </div>

      <h3 className="text-xl font-bold text-foreground mb-1 group-hover:text-primary transition-colors">{name}</h3>
      {mentor && <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Lead Mentor: {mentor}</p>}

      <div className="flex items-center gap-5 text-xs font-bold text-muted-foreground mt-auto mb-4">
        <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" />{students} Students</span>
        <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-primary" />{modules} Modules</span>
      </div>

      {progress !== undefined && (
        <div className="mb-4 space-y-2">
          <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Neural Completion</span>
            <span className="text-sm font-black text-primary italic">{progress}%</span>
          </div>
          <div className="h-2 bg-secondary/50 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full gradient-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]"
            />
          </div>
        </div>
      )}

      {onAction ? (
        <Button className="w-full h-11 gradient-primary btn-glow font-black uppercase tracking-widest text-[10px]" onClick={(e) => { e.stopPropagation(); onAction(); }}>
          {actionLabel || "Initialize Sync"}
        </Button>
      ) : onView ? (
        <div className="w-full h-11 border border-primary/20 rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-primary group-hover:bg-primary group-hover:text-white transition-all">
          Access Knowledge
        </div>
      ) : null}
    </motion.div>
  );
}

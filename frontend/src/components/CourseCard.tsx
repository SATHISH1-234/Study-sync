import { motion } from "framer-motion";
import { BookOpen, Users, Layers } from "lucide-react";
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
  const { Edit2 } = require("lucide-react");
  return (
    <motion.div
      className="glass-card p-5 flex flex-col"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        {onEdit && (
          <Button variant="ghost" size="icon" className="w-8 h-8 h-8 rounded-lg hover:bg-primary/5 hover:text-primary transition-colors" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            <Edit2 className="w-4 h-4" />
          </Button>
        )}
      </div>
      <h3 className="font-semibold text-foreground mb-1">{name}</h3>
      {mentor && <p className="text-xs text-muted-foreground mb-3">Mentor: {mentor}</p>}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto mb-3">
        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{students}</span>
        <span className="flex items-center gap-1"><Layers className="w-3.5 h-3.5" />{modules} modules</span>
      </div>
      {progress !== undefined && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress</span>
            <span className="text-primary font-medium">{progress}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full rounded-full gradient-primary progress-bar-animate"
              style={{ "--progress-width": `${progress}%` } as React.CSSProperties}
            />
          </div>
        </div>
      )}
      {onAction ? (
        <Button className="w-full text-xs gradient-primary" size="sm" onClick={onAction}>{actionLabel || "Join Course"}</Button>
      ) : onView ? (
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={onView}>View Course</Button>
      ) : null}
    </motion.div>
  );
}

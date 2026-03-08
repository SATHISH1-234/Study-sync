import { motion } from "framer-motion";
import { Users, BookOpen } from "lucide-react";

interface StudyGroupCardProps {
  name: string;
  course: string;
  mentor: string;
  studentsCount: number;
}

export default function StudyGroupCard({ name, course, mentor, studentsCount }: StudyGroupCardProps) {
  return (
    <motion.div
      className="glass-card p-5"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-3">
        <Users className="w-5 h-5 text-accent" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{name}</h3>
      <div className="space-y-1 text-xs text-muted-foreground">
        <p className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> {course}</p>
        <p>Mentor: {mentor}</p>
        <p className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {studentsCount} students</p>
      </div>
    </motion.div>
  );
}

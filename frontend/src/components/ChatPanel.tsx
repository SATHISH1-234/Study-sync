import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

const mockMessages = [
  { id: 1, user: "Alice", text: "Has anyone finished Module 3?", time: "2:30 PM", self: false },
  { id: 2, user: "You", text: "Almost done! The sorting section is tricky.", time: "2:32 PM", self: true },
  { id: 3, user: "Bob", text: "I can help with that. Let's schedule a session.", time: "2:35 PM", self: false },
];

export default function ChatPanel() {
  const [message, setMessage] = useState("");

  return (
    <div className="glass-card flex flex-col h-[400px]">
      <div className="p-4 border-b border-border font-semibold text-sm text-foreground">Group Chat</div>
      <div className="flex-1 p-4 space-y-3 overflow-auto">
        {mockMessages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.self ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              msg.self
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-secondary text-secondary-foreground rounded-bl-md"
            }`}>
              {!msg.self && <p className="text-xs font-medium mb-0.5 opacity-70">{msg.user}</p>}
              <p>{msg.text}</p>
              <p className="text-[10px] opacity-60 mt-1">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <Input
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />
        <Button size="icon" className="gradient-primary text-primary-foreground btn-glow">
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

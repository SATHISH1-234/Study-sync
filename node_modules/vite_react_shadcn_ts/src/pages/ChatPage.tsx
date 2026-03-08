import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, Send, Paperclip,
    Check, CheckCheck, User, Users, FileText, Image as ImageIcon,
    ChevronLeft, Loader2, Smile, FolderOpen, LayoutDashboard,
    BookOpen, UserCheck, GraduationCap, BarChart3, Target, Brain, Info
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

// Layout for the Chat Page
const navItemsByRole: Record<string, any[]> = {
    admin: [
        { label: "Dashboard", path: "/admin", icon: LayoutDashboard },
        { label: "Courses", path: "/admin/courses", icon: BookOpen },
        { label: "Mentors", path: "/admin/mentors", icon: UserCheck },
        { label: "Students", path: "/admin/students", icon: GraduationCap },
        { label: "Study Groups", path: "/admin/groups", icon: Users },
        { label: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    ],
    mentor: [
        { label: "Dashboard", path: "/mentor", icon: LayoutDashboard },
        { label: "My Courses", path: "/mentor/courses", icon: BookOpen },
        { label: "Messages", path: "/chat", icon: Users },
        { label: "Students", path: "/mentor/students", icon: GraduationCap },
        { label: "Resources", path: "/mentor/resources", icon: FolderOpen },
        { label: "Performance", path: "/mentor/performance", icon: BarChart3 },
    ],
    student: [
        { label: "Dashboard", path: "/student", icon: LayoutDashboard },
        { label: "My Courses", path: "/student/courses", icon: BookOpen },
        { label: "Messages", path: "/chat", icon: Users },
        { label: "Focus Mode", path: "/student/focus", icon: Target },
        { label: "Resources", path: "/student/resources", icon: FolderOpen },
        { label: "AI Reminders", path: "/student/reminders", icon: Brain },
        { label: "Progress", path: "/student/progress", icon: BarChart3 },
    ]
};

interface ChatItem {
    _id: string;
    name: string;
    lastMessage: string;
    time: string;
    unread?: number;
    type: 'individual' | 'group';
    avatar?: string;
    members?: any[];
}

export default function ChatPage() {
    const { user } = useAuth();
    const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [chats, setChats] = useState<ChatItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [showResources, setShowResources] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [resources, setResources] = useState<any[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch all chats (Groups and Enrolled Mentors/Students)
    useEffect(() => {
        const fetchChats = async () => {
            try {
                setLoading(true);
                // Fetch groups as chats based on user role
                const endpoint = user?.role === 'mentor'
                    ? `/groups/mentor/${user?._id}`
                    : `/groups/student/${user?._id}`;
                const groupRes = await api.get(endpoint);
                const rawGroups = groupRes.data.data || [];
                const formattedGroups = rawGroups.map((g: any) => ({
                    _id: g._id,
                    name: g.groupName,
                    lastMessage: "Group Chat",
                    time: new Date(g.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    type: 'group',
                    avatar: "",
                    members: [g.mentorId, ...g.students]
                }));

                let studentChats: ChatItem[] = [];
                if (user?.role === 'mentor') {
                    // Extract unique students from all groups
                    const studentsMap = new Map();
                    rawGroups.forEach((g: any) => {
                        g.students.forEach((s: any) => {
                            if (!studentsMap.has(s._id)) {
                                studentsMap.set(s._id, {
                                    _id: s._id,
                                    name: s.name,
                                    lastMessage: "Individual Chat",
                                    time: "Student",
                                    type: 'individual',
                                    avatar: s.profileImage || ""
                                });
                            }
                        });
                    });
                    studentChats = Array.from(studentsMap.values());
                }

                setChats([...formattedGroups, ...studentChats]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user?._id) fetchChats();
    }, [user?._id]);

    // Fetch messages when a chat is selected
    useEffect(() => {
        if (selectedChat) {
            const fetchMessages = async () => {
                try {
                    const endpoint = selectedChat.type === 'group'
                        ? `/chat/group/${selectedChat._id}`
                        : `/chat/individual/${selectedChat._id}`;
                    const res = await api.get(endpoint);
                    setMessages(res.data.data);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchMessages();
            // Setup interval for polling (In real app, use Socket.io)
            const interval = setInterval(fetchMessages, 5000);
            return () => clearInterval(interval);
        }
    }, [selectedChat]);

    // Fetch shared resources
    useEffect(() => {
        if (selectedChat && showResources) {
            api.get(`/chat/resources/${selectedChat._id}`)
                .then(res => setResources(res.data.data))
                .catch(err => console.error(err));
        }
    }, [selectedChat, showResources, messages.length]);

    // Auto scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;

        try {
            setSending(true);
            const payload = selectedChat.type === 'group'
                ? { groupId: selectedChat._id, content: newMessage }
                : { recipient: selectedChat._id, content: newMessage };

            const res = await api.post("/chat/send", payload);
            setMessages([...messages, res.data.data]);
            setNewMessage("");
        } catch (err) {
            toast.error("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedChat) return;

        try {
            setSending(true);
            const formData = new FormData();
            formData.append("file", file);

            // 1. Upload file
            const uploadRes = await api.post("/chat/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const { fileUrl, fileName, fileType } = uploadRes.data;

            // 2. Send as message
            const payload = selectedChat.type === 'group'
                ? { groupId: selectedChat._id, content: `Sent a ${fileType}`, fileUrl, fileName, messageType: fileType }
                : { recipient: selectedChat._id, content: `Sent a ${fileType}`, fileUrl, fileName, messageType: fileType };

            const res = await api.post("/chat/send", payload);
            setMessages([...messages, res.data.data]);
            toast.success(`${fileType} sent!`);
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setSending(false);
        }
    };

    const userRole = user?.role || 'student';
    const currentNavItems = navItemsByRole[userRole] || navItemsByRole.student;

    return (
        <DashboardLayout
            navItems={currentNavItems}
            role={userRole}
            title="Messages"
        >
            <div className="flex h-[calc(100vh-120px)] bg-background/50 glass-card overflow-hidden border-border/40 rounded-2xl">
                {/* Sidebar - Chat List */}
                <div className={`w-full md:w-80 border-r border-border/40 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-border/40 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-foreground">Chats</h2>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input className="pl-10 bg-secondary/30 border-none rounded-xl h-10" placeholder="Search chats..." />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="p-10 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
                        ) : chats.map((chat) => (
                            <div
                                key={chat._id}
                                onClick={() => setSelectedChat(chat)}
                                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-secondary/20 ${selectedChat?._id === chat._id ? 'bg-secondary/40 border-l-4 border-primary' : ''}`}
                            >
                                <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shadow-lg">
                                    {chat.type === 'group' ? <Users className="w-6 h-6" /> : chat.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-0.5">
                                        <h3 className="font-semibold text-foreground truncate text-sm">{chat.name}</h3>
                                        <span className="text-[10px] text-muted-foreground uppercase">{chat.time}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                {selectedChat ? (
                    <div className="flex-1 flex overflow-hidden">
                        <div className="flex-1 flex flex-col bg-[url('https://w0.peakpx.com/wallpaper/580/671/HD-wallpaper-whatsapp-bg-dark-backgrounds-whatsapp.jpg')] bg-fixed bg-center">
                            {/* Chat Header */}
                            <div className="p-3 px-4 flex items-center justify-between bg-card/80 backdrop-blur-md border-b border-border/40 sticky top-0 z-10">
                                <div className="flex items-center gap-3">
                                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedChat(null)}>
                                        <ChevronLeft className="w-5 h-5" />
                                    </Button>
                                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm shadow-md">
                                        {selectedChat.type === 'group' ? <Users className="w-5 h-5" /> : selectedChat.name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground text-sm">{selectedChat.name}</h3>
                                        <span className="text-[10px] text-green-400 font-medium">online</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 md:gap-3">
                                    <Button variant="ghost" size="icon" className={`rounded-full ${showResources ? 'bg-primary/20 text-primary' : ''}`} onClick={() => { setShowResources(!showResources); setShowMembers(false); }}>
                                        <FolderOpen className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className={`rounded-full ${showMembers ? 'bg-primary/20 text-primary' : ''}`} onClick={() => { setShowMembers(!showMembers); setShowResources(false); }}>
                                        <Info className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Messages Wrapper */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" ref={scrollRef}>
                                {messages.map((msg, idx) => (
                                    <motion.div
                                        key={msg._id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-3 px-4 shadow-sm relative group ${msg.sender?._id === user?._id
                                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                                            : 'bg-card text-foreground rounded-tl-none border border-border/40'
                                            }`}>
                                            {selectedChat.type === 'group' && msg.sender?._id !== user?._id && (
                                                <p className="text-[10px] font-bold text-accent mb-1">{msg.sender?.name}</p>
                                            )}
                                            {msg.messageType === 'image' && msg.fileUrl && (
                                                <img src={msg.fileUrl} alt="Chat media" className="rounded-lg mb-2 max-h-60 object-cover cursor-pointer" onClick={() => window.open(msg.fileUrl)} />
                                            )}
                                            {msg.messageType === 'file' && msg.fileUrl && (
                                                <a href={msg.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 bg-background/20 rounded-lg mb-2 hover:bg-background/40 transition-colors">
                                                    <FileText className="w-8 h-8 text-primary" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-medium truncate">{msg.fileName || "Shared File"}</p>
                                                        <p className="text-[10px] opacity-70">Click to download</p>
                                                    </div>
                                                </a>
                                            )}
                                            <p className="text-sm leading-relaxed">{msg.content}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[9px] opacity-70">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {msg.sender?._id === user?._id && <CheckCheck className="w-3 h-3 opacity-70" />}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="p-4 bg-card/80 backdrop-blur-md border-t border-border/40">
                                <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-5xl mx-auto">
                                    <input type="file" hidden ref={fileInputRef} onChange={handleFileUpload} />
                                    <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                                        <Smile className="w-6 h-6" />
                                    </Button>
                                    <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary" onClick={() => fileInputRef.current?.click()}>
                                        <Paperclip className="w-6 h-6" />
                                    </Button>
                                    <div className="flex-1 relative">
                                        <Input
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type a message..."
                                            className="bg-secondary/50 border-none rounded-2xl h-11 px-6 text-sm focus-visible:ring-1 focus-visible:ring-primary/30"
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        className="gradient-primary rounded-full w-11 h-11 p-0 flex-shrink-0 shadow-lg btn-glow"
                                        disabled={!newMessage.trim() || sending}
                                    >
                                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 text-primary-foreground" />}
                                    </Button>
                                </form>
                            </div>
                        </div>

                        {/* Right Sidebar - Resources or Members */}
                        <AnimatePresence>
                            {(showResources || showMembers) && (
                                <motion.div
                                    initial={{ x: 300, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: 300, opacity: 0 }}
                                    className="w-80 bg-card border-l border-border/40 flex flex-col hidden lg:flex shadow-2xl z-20"
                                >
                                    <div className="p-4 border-b border-border/40 flex items-center justify-between bg-secondary/10">
                                        <h3 className="font-bold text-sm">{showResources ? "Media & Files" : "Group Members"}</h3>
                                        <Button variant="ghost" size="icon" onClick={() => { setShowResources(false); setShowMembers(false); }} className="h-8 w-8 rounded-full">
                                            <ChevronLeft className="w-4 h-4 rotate-180" />
                                        </Button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4">
                                        {showResources ? (
                                            <div className="space-y-6">
                                                {/* Images Section */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-4 px-1">
                                                        <ImageIcon className="w-4 h-4 text-primary" />
                                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Recent Media</span>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {resources.filter(r => r.messageType === 'image').length > 0 ? (
                                                            resources.filter(r => r.messageType === 'image').map((img) => (
                                                                <motion.div
                                                                    key={img._id}
                                                                    whileHover={{ scale: 1.05 }}
                                                                    className="aspect-square rounded-lg overflow-hidden bg-secondary/30 border border-border/40 cursor-pointer shadow-sm"
                                                                    onClick={() => window.open(img.fileUrl)}
                                                                >
                                                                    <img src={img.fileUrl} className="w-full h-full object-cover" alt="Shared" />
                                                                </motion.div>
                                                            ))
                                                        ) : (
                                                            <p className="col-span-3 text-xs text-center text-muted-foreground py-8 italic">No media shared yet</p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="h-px bg-border/40 mx-2" />

                                                {/* Files Section */}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-4 px-1">
                                                        <FileText className="w-4 h-4 text-primary" />
                                                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Documents</span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        {resources.filter(r => r.messageType === 'file').length > 0 ? (
                                                            resources.filter(r => r.messageType === 'file').map((file) => (
                                                                <a
                                                                    key={file._id}
                                                                    href={file.fileUrl}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/40 transition-all border border-border/20 group"
                                                                >
                                                                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                                                                        <FileText className="w-5 h-5 text-primary" />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">{file.fileName}</p>
                                                                        <p className="text-[10px] text-muted-foreground uppercase">{new Date(file.createdAt).toLocaleDateString()}</p>
                                                                    </div>
                                                                </a>
                                                            ))
                                                        ) : (
                                                            <p className="text-xs text-center text-muted-foreground py-8 italic">No documents shared yet</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {selectedChat.members?.map((member: any) => (
                                                    <div key={member._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/20 transition-colors cursor-default">
                                                        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                                                            {member.profileImage ? <img src={member.profileImage} className="w-full h-full rounded-full" /> : member.name[0]}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold">{member.name}</p>
                                                            <p className="text-[10px] text-muted-foreground uppercase">{member.role || 'Member'}</p>
                                                        </div>
                                                        {member._id === user?._id && <Badge className="bg-primary/10 text-primary text-[9px] border-none">You</Badge>}
                                                    </div>
                                                ))}
                                                {(!selectedChat.members || selectedChat.members.length === 0) && (
                                                    <p className="text-xs text-center text-muted-foreground py-10">No member info available</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-card/10 border-l border-border/40">
                        <div className="max-w-xs text-center space-y-4">
                            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-2xl animate-pulse-soft">
                                <Users className="w-10 h-10 text-primary-foreground" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground">SIP Web</h2>
                            <p className="text-sm text-muted-foreground">Select a chat to start messaging with your study group or mentors.</p>
                            <div className="h-px bg-border w-16 mx-auto my-6" />
                            <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-2">
                                <CheckCheck className="w-3 h-3 text-primary" /> End-to-end encrypted
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

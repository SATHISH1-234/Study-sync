import { useState, useEffect } from "react";
import { Bell, Info, AlertTriangle, CheckCircle, BookOpen, MessageSquare, FolderOpen, Clock } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/utils/api";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await api.get("/notifications");
            setNotifications(res.data.data);
            setUnreadCount(res.data.unreadCount);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 15000); // Check every 15s
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async () => {
        try {
            await api.put("/notifications/read-all");
            setUnreadCount(0);
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'course': return <BookOpen className="w-4 h-4 text-primary" />;
            case 'chat': return <MessageSquare className="w-4 h-4 text-accent" />;
            case 'resource': return <FolderOpen className="w-4 h-4 text-orange-400" />;
            case 'reminder': return <Clock className="w-4 h-4 text-purple-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full ring-offset-background hover:bg-secondary/40 transition-all">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full bg-primary p-0 text-[10px] ring-2 ring-background">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0 glass-card border border-border/40 shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-border/40">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAsRead}
                            className="text-[10px] font-medium text-primary hover:underline"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
                <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length > 0 ? (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n._id}
                                className={`flex items-start gap-3 p-4 cursor-pointer focus:bg-secondary/20 border-b border-border/10 last:border-0 ${!n.isRead ? 'bg-primary/5' : ''}`}
                                asChild
                            >
                                <Link to={n.targetUrl || "#"}>
                                    <div className="mt-1">{getIcon(n.type)}</div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs leading-none mb-1 ${!n.isRead ? 'font-bold' : 'font-medium'}`}>{n.title}</p>
                                        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed mb-1">{n.message}</p>
                                        <p className="text-[9px] opacity-60 uppercase font-medium">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground">
                            <p className="text-xs">No notifications yet</p>
                        </div>
                    )}
                </div>
                <DropdownMenuSeparator />
                <div className="p-2 text-center border-t border-border/40">
                    <p className="text-[10px] text-muted-foreground">Stay updated with SIP Web</p>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

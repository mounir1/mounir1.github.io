import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContactMessages, type ContactMessage, type MessageStatus } from "@/hooks/useContactMessages";
import {
  Mail, MailOpen, Reply, Archive, Trash2, Search,
  Clock, Building, Phone, Loader2, Inbox, RefreshCw, Download,
} from "lucide-react";

function downloadJSON(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const STATUS_CONFIG: Record<MessageStatus, { label: string; color: string; icon: any }> = {
  unread:   { label: "Unread",   color: "bg-blue-500/15 text-blue-700 border-blue-500/30",     icon: Mail },
  read:     { label: "Read",     color: "bg-muted/50 text-muted-foreground border-border",      icon: MailOpen },
  replied:  { label: "Replied",  color: "bg-green-500/15 text-green-700 border-green-500/30",  icon: Reply },
  archived: { label: "Archived", color: "bg-yellow-500/15 text-yellow-700 border-yellow-500/30", icon: Archive },
  spam:     { label: "Spam",     color: "bg-red-500/15 text-red-700 border-red-500/30",        icon: Trash2 },
};

const TYPE_LABELS: Record<string, string> = {
  general: "General",
  project: "Project Inquiry",
  hire: "Hire Me",
  collaboration: "Collaboration",
  other: "Other",
};

function formatDate(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / 3600000;
  if (diffH < 1) return `${Math.round(diffMs / 60000)}m ago`;
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  if (diffH < 168) return `${Math.round(diffH / 24)}d ago`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function MessageRow({
  msg,
  onSelect,
  selected,
}: {
  msg: ContactMessage;
  onSelect: () => void;
  selected: boolean;
}) {
  const cfg = STATUS_CONFIG[msg.status];
  const Icon = cfg.icon;
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
        selected
          ? "bg-primary/5 border-primary/30 shadow-sm"
          : msg.status === "unread"
          ? "bg-card border-border hover:border-primary/30 hover:bg-primary/3"
          : "bg-muted/20 border-border/60 hover:border-border"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg shrink-0 ${msg.status === "unread" ? "bg-blue-500/10" : "bg-muted/50"}`}>
          <Icon className={`h-4 w-4 ${msg.status === "unread" ? "text-blue-600" : "text-muted-foreground"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className={`font-medium truncate ${msg.status === "unread" ? "text-foreground" : "text-muted-foreground"}`}>
              {msg.name}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">{formatDate(msg.createdAt)}</span>
          </div>
          <div className="text-sm font-medium truncate mb-1">{msg.subject}</div>
          <div className="text-xs text-muted-foreground truncate">{msg.message}</div>
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`text-xs ${cfg.color}`}>{cfg.label}</Badge>
            <Badge variant="outline" className="text-xs">{TYPE_LABELS[msg.type] ?? msg.type}</Badge>
            {msg.company && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Building className="h-3 w-3" /> {msg.company}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export function MessagesTab() {
  const { messages, loading, markRead, markReplied, markStatus, deleteMessage, unreadCount } =
    useContactMessages();

  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<MessageStatus | "all">("all");

  const filtered = messages.filter((m) => {
    const matchStatus = filterStatus === "all" || m.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.message.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  async function handleSelect(msg: ContactMessage) {
    setSelected(msg);
    if (msg.status === "unread") await markRead(msg.id);
  }

  async function handleAction(action: "replied" | "archived" | "spam") {
    if (!selected) return;
    if (action === "replied") await markReplied(selected.id);
    else await markStatus(selected.id, action);
    setSelected((prev) => prev ? { ...prev, status: action } : null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Messages</h2>
          {unreadCount > 0 && (
            <Badge className="bg-blue-500 text-white">{unreadCount} unread</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { const ts = new Date().toISOString().slice(0,10); downloadJSON(messages, `messages-${ts}.json`); }} disabled={!messages.length}>
            <Download className="h-4 w-4 mr-2" />Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Messages</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Message List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border rounded-xl bg-muted/10">
              <Inbox className="h-12 w-12 mb-3 opacity-30" />
              <p className="font-medium">No messages</p>
              <p className="text-sm">
                {search || filterStatus !== "all" ? "Try adjusting your filters" : "Contact form submissions will appear here"}
              </p>
            </div>
          ) : (
            filtered.map((msg) => (
              <MessageRow
                key={msg.id}
                msg={msg}
                onSelect={() => handleSelect(msg)}
                selected={selected?.id === msg.id}
              />
            ))
          )}
        </div>

        {/* Message Detail */}
        <div>
          {selected ? (
            <Card className="border-0 shadow-medium sticky top-24">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{selected.subject}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={STATUS_CONFIG[selected.status].color}>
                        {STATUS_CONFIG[selected.status].label}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {TYPE_LABELS[selected.type]}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>✕</Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sender Info */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs">From</span>
                    <div className="font-medium">{selected.name}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs">Email</span>
                    <div className="font-medium break-all">
                      <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                        {selected.email}
                      </a>
                    </div>
                  </div>
                  {selected.company && (
                    <div>
                      <span className="text-muted-foreground text-xs">Company</span>
                      <div className="font-medium flex items-center gap-1">
                        <Building className="h-3 w-3" /> {selected.company}
                      </div>
                    </div>
                  )}
                  {selected.phone && (
                    <div>
                      <span className="text-muted-foreground text-xs">Phone</span>
                      <div className="font-medium flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${selected.phone}`} className="text-primary hover:underline">
                          {selected.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {selected.budget && (
                    <div>
                      <span className="text-muted-foreground text-xs">Budget</span>
                      <div className="font-medium">{selected.budget}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground text-xs">Received</span>
                    <div className="font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(selected.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Message Body */}
                <div className="p-4 bg-muted/20 rounded-lg">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => window.open(`mailto:${selected.email}?subject=Re: ${selected.subject}`, "_blank")}
                  >
                    <Reply className="h-4 w-4 mr-2" />
                    Reply via Email
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction("replied")}
                    disabled={selected.status === "replied"}
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    Mark Replied
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction("archived")}
                    disabled={selected.status === "archived"}
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleAction("spam")}
                    disabled={selected.status === "spam"}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Spam
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!confirm("Permanently delete this message? This cannot be undone.")) return;
                      await deleteMessage(selected.id);
                      setSelected(null);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete Permanently
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground border rounded-xl bg-muted/10 border-dashed">
              <Mail className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm">Select a message to read it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

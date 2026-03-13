import { mockReminders } from "@/lib/mock-data";
import { format, isPast, isToday, isTomorrow } from "date-fns";
import { CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Reminders() {
  const [reminders, setReminders] = useState(mockReminders);
  const sorted = [...reminders].sort((a, b) => {
    if (a.is_done !== b.is_done) return a.is_done ? 1 : -1;
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
  });

  const toggleDone = (id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, is_done: !r.is_done } : r));
  };

  return (
    <div className="max-w-2xl space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Reminders</h1>
        <p className="text-sm text-muted-foreground">{reminders.filter(r => !r.is_done).length} pending</p>
      </div>

      <div className="space-y-2">
        {sorted.map(r => {
          const due = new Date(r.due_at);
          const overdue = isPast(due) && !r.is_done;
          return (
            <div
              key={r.id}
              className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${r.is_done ? "opacity-50" : ""}`}
            >
              <button onClick={() => toggleDone(r.id)} className="mt-0.5 shrink-0">
                <CheckCircle2 className={`h-5 w-5 ${r.is_done ? "text-success" : "text-muted-foreground hover:text-foreground"}`} />
              </button>
              <div className="min-w-0 flex-1">
                <p className={`text-sm leading-snug ${r.is_done ? "line-through" : ""}`}>{r.text}</p>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Link to={`/contacts/${r.contact_id}`} className="hover:text-primary">{r.contact_name}</Link>
                  <span>·</span>
                  <span className={overdue ? "text-destructive font-medium" : ""}>
                    {overdue ? "Overdue" : isToday(due) ? "Today" : isTomorrow(due) ? "Tomorrow" : format(due, "MMM d")}
                  </span>
                  {r.auto_generated && (
                    <span className="flex items-center gap-0.5 text-primary">
                      <Sparkles className="h-3 w-3" /> auto
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

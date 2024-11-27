// components/audit-log/index.jsx
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { HistoryIcon } from "lucide-react";
import { useAuditLogContext } from "@/context/AuditLogContext";

function AuditLogViewer() {
  const { auditLogs } = useAuditLogContext();

  const getActionColor = (action) => {
    switch (action) {
      case "create":
        return "text-green-600";
      case "update":
        return "text-blue-600";
      case "delete":
        return "text-red-600";
      case "error":
        return "text-yellow-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <HistoryIcon className="h-4 w-4 mr-2" />
          View History
        </Button>
      </SheetTrigger>
      <SheetContent position="right" size="lg">
        <SheetHeader>
          <SheetTitle>Change History</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-4">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-4 border-b last:border-0">
              <div className="flex justify-between items-start mb-2">
                <span
                  className={`text-sm font-medium ${getActionColor(
                    log.action
                  )}`}
                >
                  {log.action.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  {format(
                    new Date(log.timestamp),
                    "dd MMM yyyy HH:mm:ss"
                  )}
                </span>
              </div>
              <div className="text-sm">
                <p className="font-medium">
                  {log.section.toUpperCase()}
                </p>
                <p className="text-gray-600">{log.details}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default AuditLogViewer;

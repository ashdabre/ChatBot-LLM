import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 p-4 bg-muted/50">
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className="bg-secondary">
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      
      <div className="flex items-center space-x-1 mt-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-75"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};
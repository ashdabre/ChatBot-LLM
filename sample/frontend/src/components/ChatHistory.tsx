import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, MessageSquare, Trash2, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatHistoryItem {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

interface ChatHistoryProps {
  chats: ChatHistoryItem[];
  currentChatId?: string;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
}

export const ChatHistory = ({ chats, currentChatId, onSelectChat, onDeleteChat }: ChatHistoryProps) => {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const groupedChats = chats.reduce((acc, chat) => {
    const dateGroup = formatDate(chat.timestamp);
    if (!acc[dateGroup]) {
      acc[dateGroup] = [];
    }
    acc[dateGroup].push(chat);
    return acc;
  }, {} as Record<string, ChatHistoryItem[]>);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat History
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-full mt-6 pr-4">
          {Object.keys(groupedChats).length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <Clock className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No chat history yet</p>
              <p className="text-sm text-muted-foreground">Start a conversation to see it here</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedChats).map(([dateGroup, chatsInGroup]) => (
                <div key={dateGroup}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-0 bg-background">
                    {dateGroup}
                  </h3>
                  <div className="space-y-2">
                    {chatsInGroup.map((chat) => (
                      <div
                        key={chat.id}
                        className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                          currentChatId === chat.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => onSelectChat(chat.id)}
                      >
                        <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium truncate">{chat.title}</h4>
                          <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-muted-foreground">
                              {chat.messageCount} messages
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
import { Plus, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChatHistory } from "./ChatHistory";

interface ChatHeaderProps {
  user?: any;
  chats: any[];
  currentChatId?: string;
  onNewChat: () => void;
  onSelectChat: (chatId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onLogout: () => void;
}

export const ChatHeader = ({ 
  user, 
  chats, 
  currentChatId, 
  onNewChat, 
  onSelectChat, 
  onDeleteChat, 
  onLogout 
}: ChatHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 bg-background border-b border-border">
      <ChatHistory 
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={onSelectChat}
        onDeleteChat={onDeleteChat}
      />
      
      <h1 className="font-semibold text-foreground">ChatGPT</h1>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onNewChat}>
          <Plus className="h-5 w-5" />
        </Button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>
                    {user.name?.charAt(0) || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>
                <User className="mr-2 h-4 w-4" />
                {user.name}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <User className="h-4 w-4 mr-1" />
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
};
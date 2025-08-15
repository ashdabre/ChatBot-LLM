import { useState, useEffect, useRef } from "react";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { EmptyState } from "@/components/EmptyState";
import { TypingIndicator } from "@/components/TypingIndicator";
import AuthPage from "../components/AuthPage";
import { toast } from "sonner";
import { supabase } from "../lib/supabaseClient";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  type?: "text" | "voice" | "image";
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: string;
  timestamp: string;
  messageCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // offline / quota handling
  const offlineModeRef = useRef(false);
  const tokenWarningShownRef = useRef(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) handleLogin(session.user);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleLogin(session.user);
      else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const fetchChats = async (userId: string) => {
    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error(error);
      toast.error("Failed to load chats");
    } else {
      setChats(
        (data || []).map((chat: any) => ({
          id: chat.id,
          title: chat.title,
          messages: chat.messages || [],
          lastMessage: chat.last_message,
          timestamp: chat.timestamp,
          messageCount: chat.message_count,
        }))
      );
    }
  };

  const handleLogin = async (userData: any) => {
    const mappedUser: User = {
      id: userData.id,
      name: userData.user_metadata?.name || userData.email || "User",
      email: userData.email,
      avatar: userData.user_metadata?.avatar_url,
    };
    setUser(mappedUser);
    setIsAuthenticated(true);
    toast.success(`Welcome back, ${mappedUser.name}!`);
    await fetchChats(userData.id);
  };

  const handleContinueAsGuest = () => {
    setIsAuthenticated(true);
    toast.success("Continuing as guest");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setChats([]);
    setCurrentChatId(null);
    setCurrentMessages([]);
    toast.success("Signed out successfully");
  };

  const generateChatTitle = (firstMessage: string) =>
    firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage;

  const saveChatToDB = async (chat: ChatSession) => {
    if (!user) return;
    try {
      await supabase.from("chats").upsert({
        id: chat.id,
        user_id: user.id,
        title: chat.title,
        messages: chat.messages,
        last_message: chat.lastMessage,
        timestamp: chat.timestamp,
        message_count: chat.messageCount,
      });
    } catch (e) {
      console.error("Failed saving chat:", e);
    }
  };

  const deleteChatFromDB = async (chatId: string) => {
    if (!user) return;
    try {
      await supabase.from("chats").delete().eq("id", chatId).eq("user_id", user.id);
    } catch (e) {
      console.error("Failed deleting chat:", e);
    }
  };

  // offline canned responses
  const offlineResponse = (prompt: string) => {
    const lower = prompt.toLowerCase();
    if (lower.includes("short info") || lower.includes("japan")) {
      return "Japan is an island nation in East Asia, known for cherry blossoms, sushi, Mount Fuji, and its blend of tradition & technology.";
    }
    if (lower.includes("days") && (lower.includes("trip") || lower.includes("itinerary") || lower.includes("plan"))) {
      const place = prompt.match(/to\s(.+)/i)?.[1] || "your destination";
      return `Here’s a 10-day itinerary for ${place}:
Day 1: Arrival & settle in
Day 2: City sightseeing
Day 3: Cultural landmarks
Day 4: Day trip nearby
Day 5: Nature exploration
Day 6: Food tour
Day 7: Adventure activities
Day 8: Shopping & nightlife
Day 9: Relax & spa
Day 10: Departure`;
    }
    if (lower.includes("things to carry") || lower.includes("what to pack")) {
      return "Essentials: Passport, travel tickets, wallet, phone, charger, clothes, toiletries, comfortable shoes, medicines, reusable water bottle.";
    }
    if (lower.includes("hello this is my internship assignment")) {
      return "Very good! Need any help? 😊";
    }
    return "Sorry, I couldn't process that without AI. Please try again later.";
  };

  // Robust backend call - supports multiple response shapes
  const getAIResponseFromGemini = async (prompt: string) => {
    if (offlineModeRef.current) {
      return offlineResponse(prompt);
    }

    try {
 const GEMINI_API_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:3000/api/gemini"
    : "https://chatbot-llm-backend-node.onrender.com/api/gemini";

const res = await fetch(GEMINI_API_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ prompt }),
});
      // If backend returns non-OK, read text for debugging and fallback
      if (!res.ok) {
        const errText = await res.text();
        console.error("Backend returned non-OK:", res.status, errText);
        if (errText.includes("RESOURCE_EXHAUSTED") || errText.includes("quota") || res.status === 429) {
          offlineModeRef.current = true;
          if (!tokenWarningShownRef.current) {
            tokenWarningShownRef.current = true;
            return "⚠️ Token/quota exceeded — switching to offline mode.";
          }
          return offlineResponse(prompt);
        }
        return `Error fetching AI: ${res.status}`;
      }

      const data = await res.json();
      console.log("Backend /api/gemini response:", data); // <-- debug log to inspect what backend returns

      // Primary: use generatedText field
      if (typeof data?.generatedText === "string" && data.generatedText.trim().length > 0) {
        return data.generatedText;
      }

      // Try some other common shapes (raw Gemini style)
      if (Array.isArray(data?.raw?.candidates) && data.raw.candidates.length > 0) {
        const candidate = data.raw.candidates[0];
        const parts = candidate?.content?.parts;
        if (Array.isArray(parts) && parts.length > 0) {
          const joined = parts.map((p: any) => p.text || "").join("");
          if (joined.trim().length > 0) return joined;
        }
        if (typeof candidate?.output_text === "string" && candidate.output_text.trim()) return candidate.output_text;
      }

      // fallback to other fields
      if (typeof data?.text === "string" && data.text.trim()) return data.text;
      const maybe = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.result?.content?.text;
      if (typeof maybe === "string" && maybe.trim()) return maybe;

      console.warn("No usable text found in backend response, returning offline fallback. Response:", data);
      return offlineResponse(prompt);
    } catch (err: any) {
      console.error("Gemini fetch error:", err);
      offlineModeRef.current = true;
      if (!tokenWarningShownRef.current) {
        tokenWarningShownRef.current = true;
        return "⚠️ Token/quota / network error — switching to offline mode.";
      }
      return offlineResponse(prompt);
    }
  };

  // ========================
  // Send message logic
  // ========================
  const handleSendMessage = async (content: string, type: "text" | "voice" | "image" = "text") => {
    const timestamp = new Date().toISOString();
    const userMessage: Message = { id: Date.now().toString(), content, isUser: true, timestamp, type };

    // Add user message immediately to UI
    const updatedMessages = [...currentMessages, userMessage];
    setCurrentMessages(updatedMessages);

    // Determine chat
    let activeChatId = currentChatId;
    let updatedChats: ChatSession[] = chats;

    if (activeChatId) {
      updatedChats = chats.map((chat) =>
        chat.id === activeChatId
          ? { ...chat, messages: updatedMessages, lastMessage: content, timestamp, messageCount: updatedMessages.length }
          : chat
      );
    } else {
      const newChat: ChatSession = {
        id: crypto.randomUUID(),
        title: generateChatTitle(content),
        messages: updatedMessages,
        lastMessage: content,
        timestamp,
        messageCount: updatedMessages.length,
      };
      activeChatId = newChat.id;
      updatedChats = [newChat, ...chats];
      setCurrentChatId(newChat.id);
    }

    setChats(updatedChats);
    setIsTyping(true);

    // Save user message quickly
    const chatToSave = updatedChats.find((c) => c.id === activeChatId)!;
    await saveChatToDB(chatToSave);

    // Call backend
    const aiReply = await getAIResponseFromGemini(content);

    // Create AI message and append
    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiReply,
      isUser: false,
      timestamp: new Date().toISOString(),
      type: "text",
    };

    const finalMessages = [...updatedMessages, aiMessage];
    setCurrentMessages(finalMessages);

    const finalChats = updatedChats.map((chat) =>
      chat.id === activeChatId
        ? { ...chat, messages: finalMessages, lastMessage: aiMessage.content, timestamp: aiMessage.timestamp, messageCount: finalMessages.length }
        : chat
    );

    setChats(finalChats);
    setIsTyping(false);

    // Persist final chat
    await saveChatToDB(finalChats.find((c) => c.id === activeChatId)!);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setCurrentMessages([]);
    toast.success("New chat started");
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    const chat = chats.find((c) => c.id === chatId);
    if (chat) setCurrentMessages(chat.messages);
  };

  const handleDeleteChat = async (chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setCurrentMessages([]);
    }
    await deleteChatFromDB(chatId);
    toast.success("Chat deleted");
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} onContinueAsGuest={handleContinueAsGuest} />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <ChatHeader
        user={user}
        chats={chats}
        currentChatId={currentChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        onLogout={handleLogout}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {currentMessages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2">
            {currentMessages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message.content}
                isUser={message.isUser}
                timestamp={new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              />
            ))}
            {isTyping && <TypingIndicator />}
          </div>
        )}
      </div>

      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
};

export default Index;

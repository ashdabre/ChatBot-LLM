import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Camera, MicOff, Square, Image } from "lucide-react";
import { toast } from "sonner";

interface ChatInputProps {
  onSendMessage: (message: string, type?: 'text' | 'voice' | 'image') => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setMessage(prev => prev + finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error("Speech recognition error");
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        
        const audioChunks: BlobPart[] = [];
        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          // Simulate sending voice message
          onSendMessage("🎤 Voice message recorded", 'voice');
          stream.getTracks().forEach(track => track.stop());
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        toast.success("Recording started");
      } catch (error) {
        toast.error("Could not access microphone");
      }
    }
  };

  const toggleSpeechRecognition = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success("Listening...");
      } else {
        toast.error("Speech recognition not supported");
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate image upload
      onSendMessage(`📷 Image uploaded: ${file.name}`, 'image');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Simulate camera functionality
      toast.success("Camera access granted");
      stream.getTracks().forEach(track => track.stop());
      onSendMessage("📸 Photo captured", 'image');
    } catch (error) {
      toast.error("Could not access camera");
    }
  };

  return (
    <div className="p-4 bg-background border-t border-border">
      <div className="flex gap-2 items-end">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message ChatGPT..."
            className="min-h-[44px] max-h-32 resize-none pr-20 text-base"
            disabled={disabled}
          />
          <div className="absolute right-2 bottom-2 flex gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <Image className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={openCamera}
            >
              <Camera className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className={`h-8 w-8 ${isListening ? 'bg-primary text-primary-foreground' : ''}`}
              onClick={toggleSpeechRecognition}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-11 w-11 ${isRecording ? 'bg-destructive text-destructive-foreground' : ''}`}
          onClick={toggleVoiceRecording}
        >
          {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        
        <Button 
          onClick={handleSend} 
          disabled={!message.trim() || disabled}
          size="icon"
          className="h-11 w-11"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {isRecording && (
        <div className="mt-2 text-center">
          <span className="text-sm text-destructive animate-pulse">🔴 Recording...</span>
        </div>
      )}
      
      {isListening && (
        <div className="mt-2 text-center">
          <span className="text-sm text-primary animate-pulse">🎤 Listening...</span>
        </div>
      )}
    </div>
  );
};
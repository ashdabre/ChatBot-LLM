import { MessageCircle, Lightbulb, Edit, Code } from "lucide-react";

export const EmptyState = () => {
  const suggestions = [
    {
      icon: MessageCircle,
      title: "Help me write",
      subtitle: "a professional email"
    },
    {
      icon: Lightbulb,
      title: "Give me ideas",
      subtitle: "for a weekend project"
    },
    {
      icon: Edit,
      title: "Create a plan",
      subtitle: "for learning a new skill"
    },
    {
      icon: Code,
      title: "Explain code",
      subtitle: "in simple terms"
    }
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-8">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
          <MessageCircle className="h-8 w-8 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          How can I help you today?
        </h2>
        <p className="text-muted-foreground">
          Ask me anything or try one of these suggestions
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
        {suggestions.map((suggestion, index) => {
          const IconComponent = suggestion.icon;
          return (
            <button
              key={index}
              className="p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-left"
            >
              <IconComponent className="h-5 w-5 text-primary mb-2" />
              <div className="text-sm font-medium text-foreground">
                {suggestion.title}
              </div>
              <div className="text-xs text-muted-foreground">
                {suggestion.subtitle}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
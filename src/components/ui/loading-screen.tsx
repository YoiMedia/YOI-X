import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

export function LoadingScreen({ 
  message = "Loading your workspace...", 
  className,
  fullScreen = true
}: LoadingScreenProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8",
      fullScreen ? "h-screen w-screen fixed inset-0 z-50 bg-background/80 backdrop-blur-md" : "h-full w-full min-h-[400px]",
      className
    )}>
      <div className="relative flex flex-col items-center">
        {/* Animated Background Ring */}
        <div className="absolute -inset-10 bg-primary/20 rounded-full blur-2xl animate-pulse" />
        
        {/* Main Spinner */}
        <div className="relative">
          <Loader2 className="h-16 w-16 text-primary animate-spin" strokeWidth={1} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 bg-primary rounded-full animate-ping" />
          </div>
        </div>
        
        {/* Brand/Message */}
        <div className="mt-8 text-center space-y-2">
          <h2 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            Yoi Media
          </h2>
          <p className="text-muted-foreground text-sm font-medium animate-pulse">
            {message}
          </p>
        </div>
        
        {/* Progress bar-like indicator */}
        <div className="mt-10 w-48 h-1 bg-secondary rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%' }}>
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}

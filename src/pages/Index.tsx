
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import GameContainer from "@/components/GameContainer";

const Index = () => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-gray-100 p-2 md:p-4">
      <div className="container mx-auto">
        <header className="text-center mb-4 md:mb-6">
          <h1 className={`${isMobile ? "text-2xl" : "text-4xl"} font-bold text-gray-800 mb-2`}>
            Grannies and Thugs
          </h1>
          <p className="text-gray-600 max-w-md mx-auto text-sm md:text-base">
            Escape town before the grannies slow you down or the police catch you!
          </p>
        </header>
        
        <main>
          <GameContainer />
        </main>
        
        <footer className="mt-4 md:mt-8 text-center text-gray-500 text-xs md:text-sm">
          <p>A strategy board game inspired by The Downfall of Pompeii (2004)</p>
          <p className="mt-1">
            © {new Date().getFullYear()} Grannies and Thugs. All rights reserved. 
            Inspired by The Downfall of Pompeii by Heidelberger Spieleverlag.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

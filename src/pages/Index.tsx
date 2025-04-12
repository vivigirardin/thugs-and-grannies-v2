
import React from "react";
import GameContainer from "@/components/GameContainer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="container mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Grannies and Thugs</h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Escape town before the grannies slow you down or the police catch you!
          </p>
        </header>
        
        <main>
          <GameContainer />
        </main>
        
        <footer className="mt-8 text-center text-gray-500 text-sm">
          <p>A strategy board game inspired by The Downfall of Pompeii (2004)</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

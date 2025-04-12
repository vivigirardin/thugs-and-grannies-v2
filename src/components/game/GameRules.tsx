
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle,
  DrawerTrigger
} from "@/components/ui/drawer";

const GameRules: React.FC = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  const rulesContent = (
    <div className="space-y-2 text-left">
      <h3 className={`font-bold ${isMobile ? "text-sm" : "text-base"}`}>How to Play:</h3>
      <ul className={`list-disc pl-5 space-y-1 ${isMobile ? "text-xs" : "text-sm"}`}>
        <li>Roll the dice to move one of your team members.</li>
        <li>Move the exact number of spaces shown on the dice.</li>
        <li>Watch out for the expanding police chains!</li>
        <li>Grannies will slow you down - avoid them if possible.</li>
        <li>Get your team to the exits before they get caught.</li>
        <li>If caught by police, your thug goes to jail.</li>
      </ul>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            Game Rules
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-4 pb-4">
          <DrawerHeader className="text-left">
            <DrawerTitle>Game Rules</DrawerTitle>
          </DrawerHeader>
          {rulesContent}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-xl font-bold mb-3">Game Rules</h2>
      {rulesContent}
    </div>
  );
};

export default GameRules;

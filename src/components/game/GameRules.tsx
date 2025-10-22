
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
    <div className="space-y-4 text-left">
      <div className="space-y-2">
        <h3 className={`font-bold ${isMobile ? "text-sm" : "text-base"}`}>Goal:</h3>
        <p className={`${isMobile ? "text-xs" : "text-sm"}`}>
          Get as many of your gang members to the exits as possible. The team with the most escaped members wins!
        </p>
      </div>

      <div className="space-y-2">
        <h3 className={`font-bold ${isMobile ? "text-sm" : "text-base"}`}>How to Play:</h3>
        <ul className={`list-disc pl-5 space-y-2 ${isMobile ? "text-xs" : "text-sm"}`}>
          <li>Select your team: Gang (red), Mafia (green), Politicians (blue), or Cartel (yellow).</li>
          <li>Draw cards to get movement steps - the card will tell you how many spaces you can move.</li>
          <li>Get your members to any exit square (green) to escape successfully.</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className={`font-bold ${isMobile ? "text-sm" : "text-base"}`}>Watch Out For:</h3>
        <ul className={`list-disc pl-5 space-y-2 ${isMobile ? "text-xs" : "text-sm"}`}>
          <li><span className="font-semibold">Police (Blue):</span> Start in the center and expand outward each round. If they catch you, it's straight to jail!</li>
          <li><span className="font-semibold">Grannies (Pink):</span> You must go around them - no passing through granny squares!</li>
        </ul>
      </div>

      <div className="space-y-2">
        <h3 className={`font-bold ${isMobile ? "text-sm" : "text-base"}`}>Tips:</h3>
        <ul className={`list-disc pl-5 space-y-2 ${isMobile ? "text-xs" : "text-sm"}`}>
          <li>Plan your escape route carefully to avoid getting trapped by police.</li>
          <li>Keep track of your escaped members - they're counted at the top of the board.</li>
          <li>Sometimes waiting a turn is better than moving into a risky position.</li>
        </ul>
      </div>
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


import React from "react";
import { useGame } from "@/context/GameContext";

interface TurnStepGuideProps {
  currentStep: number;
}

const TurnStepGuide: React.FC<TurnStepGuideProps> = ({ currentStep }) => {
  return (
    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 w-full mt-2">
      <h3 className="font-bold mb-1 text-amber-800 text-sm">Turn Order:</h3>
      <ol className="list-decimal text-sm text-amber-700 pl-5">
        <li className={currentStep > 1 ? "line-through opacity-60" : "font-bold"}>Draw a card OR play a card</li>
        <li className={currentStep > 2 ? "line-through opacity-60" : currentStep === 2 ? "font-bold" : ""}>Roll the dice</li>
        <li className={currentStep === 3 ? "font-bold" : ""}>Move a meeple</li>
        <li>End turn</li>
      </ol>
    </div>
  );
};

export default TurnStepGuide;

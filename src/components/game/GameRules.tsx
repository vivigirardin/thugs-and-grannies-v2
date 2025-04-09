
import React from "react";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const GameRules: React.FC = () => {
  return (
    <div className="max-w-md mx-auto">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="rules">
          <AccordionTrigger>Game Rules</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-bold">Objective:</h3>
                <p>Get your gang members to escape through the exits without getting caught by police!</p>
              </div>
              
              <div>
                <h3 className="font-bold">How to Play:</h3>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Roll the dice on your turn to determine how far you can move.</li>
                  <li>Move your character by clicking on a highlighted cell.</li>
                  <li>Watch out for police! If you land on a police space, you'll be arrested.</li>
                  <li>Grannies will slow you down - landing on a granny space will end your turn.</li>
                  <li>Reach an exit to escape and earn points for your team.</li>
                  <li>The team with the most escaped members wins!</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-bold">Teams:</h3>
                <ul className="list-disc list-inside">
                  <li><span className="font-medium">The Creeps Gang</span> - Street thugs with quick moves</li>
                  <li><span className="font-medium">Italian Mafia</span> - Old-school gangsters with connections</li>
                  <li><span className="font-medium">Politicians</span> - Corrupt officials with influence</li>
                  <li><span className="font-medium">Japanese Mafia</span> - Yakuza with honor code</li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default GameRules;

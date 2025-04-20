
import plugin from 'tailwindcss/plugin';

export const gameColors = plugin(function({ addUtilities }) {
  const newUtilities = {
    '.bg-game-gang': { backgroundColor: '#e11d48' },
    '.bg-game-mafia': { backgroundColor: '#1e40af' },
    '.bg-game-politicians': { backgroundColor: '#7e22ce' },
    '.bg-game-cartel': { backgroundColor: '#b45309' },
    '.border-game-gang': { borderColor: '#e11d48' },
    '.border-game-mafia': { borderColor: '#1e40af' },
    '.border-game-politicians': { borderColor: '#7e22ce' },
    '.border-game-cartel': { borderColor: '#b45309' },
    '.text-game-gang': { color: '#e11d48' },
    '.text-game-mafia': { color: '#1e40af' },
    '.text-game-politicians': { color: '#7e22ce' },
    '.text-game-cartel': { color: '#b45309' },
  };

  addUtilities(newUtilities);
});


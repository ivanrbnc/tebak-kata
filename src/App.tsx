import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, HelpCircle, PartyPopper } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WordData {
  word: string;
  hint: string;
  emoji: string;
}

const WORDS: WordData[] = [
  { word: "LEBARAN", hint: "Hari raya umat Muslim setelah Ramadan", emoji: "🌙" },
  { word: "KETUPAT", hint: "Makanan khas dari beras dalam anyaman janur", emoji: "🍲" },
  { word: "MUDIK", hint: "Tradisi pulang ke kampung halaman", emoji: "🚗" },
];

const QWERTY_ROWS = [
  "QWERTYUIOP".split(""),
  "ASDFGHJKL".split(""),
  "ZXCVBNM".split("")
];

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'won'>('start');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<Set<string>>(new Set());

  const currentWordData = WORDS[currentWordIndex];
  const currentWord = currentWordData.word.toUpperCase();

  const handleStart = () => {
    setGameState('playing');
    setCurrentWordIndex(0);
    setGuessedLetters(new Set());
  };

  const handleGuess = useCallback((letter: string | undefined) => {
    if (!letter || gameState !== 'playing') return;
    const upperLetter = letter.toUpperCase();
    const isLetter = QWERTY_ROWS.some(row => row.includes(upperLetter));
    if (!isLetter) return;

    setGuessedLetters(prev => {
      if (prev.has(upperLetter)) return prev;
      const next = new Set(prev);
      next.add(upperLetter);
      return next;
    });
  }, [gameState]);

  // Physical Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      handleGuess(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleGuess]);

  const handleHint = () => {
    const unrevealed = currentWord.split('').filter((char) => {
      return !guessedLetters.has(char);
    });

    if (unrevealed.length > 0) {
      const randomChar = unrevealed[Math.floor(Math.random() * unrevealed.length)];
      handleGuess(randomChar);
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    const allGuessed = currentWord.split('').every(char => guessedLetters.has(char));
    if (allGuessed) {
      setGameState('won');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff69b4', '#4caf50', '#ffffff']
      });
    }
  }, [guessedLetters, currentWord, gameState]);

  const nextWord = () => {
    if (currentWordIndex < WORDS.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setGuessedLetters(new Set());
      setGameState('playing');
    } else {
      setGameState('start');
    }
  };

  return (
    <div className="container">
      <AnimatePresence mode="wait">
        {gameState === 'start' && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card"
          >
            <motion.span className="emoji-hint floating" style={{ fontSize: '10rem' }}>🕌</motion.span>
            <h1>Sambung Kata</h1>
            <p style={{ marginBottom: '2.5rem', fontSize: '1.4rem', color: '#555', fontWeight: 500 }}>
              Halal Bi Halal Edition
            </p>
            <button className="btn btn-pink" onClick={handleStart}>
              <Play size={28} fill="currentColor" /> Mulai Bermain!
            </button>
          </motion.div>
        )}

        {gameState === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card"
          >
            <span className="emoji-hint floating">{currentWordData.emoji}</span>
            <div className="hint-box">
              <div className="hint-text">
                Petunjuk:
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4caf50' }}>
                {currentWordData.hint}
              </div>
            </div>

            <div className="word-display">
              {currentWord.split('').map((char, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring' }}
                  className="letter-slot"
                >
                  {guessedLetters.has(char) ? char : ""}
                </motion.div>
              ))}
            </div>

            <div className="keyboard">
              {QWERTY_ROWS.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                  {row.map(char => {
                    const isGuessed = guessedLetters.has(char);
                    const isCorrect = isGuessed && currentWord.includes(char);
                    const isIncorrect = isGuessed && !currentWord.includes(char);

                    return (
                      <button
                        key={char}
                        disabled={isGuessed}
                        className={`key ${isCorrect ? 'correct' : ''} ${isIncorrect ? 'incorrect' : ''}`}
                        onClick={() => handleGuess(char)}
                      >
                        {char}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <button className="btn btn-hint" onClick={handleHint}>
              <HelpCircle size={24} /> Tombol Bantuan
            </button>
          </motion.div>
        )}

        {gameState === 'won' && (
          <motion.div
            key="won"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <PartyPopper size={80} color="#ff69b4" strokeWidth={1.5} style={{ marginBottom: '1rem' }} />
            </motion.div>
            <h1>Hebat!</h1>
            <p style={{ fontSize: '1.5rem', marginBottom: '2rem', fontWeight: 600 }}>
              Kamu berhasil menebak kata: <span style={{ color: '#4caf50' }}>{currentWord}</span>
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {currentWordIndex < WORDS.length - 1 ? (
                <button className="btn btn-green" onClick={nextWord}>
                  Kata Selanjutnya <Play size={20} fill="currentColor" />
                </button>
              ) : (
                <button className="btn btn-pink" onClick={() => setGameState('start')}>
                  Main Lagi! <RotateCcw size={20} />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

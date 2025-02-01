import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import GameCompletionModal from './components/GameCompletionModal';
import BingoCard from './components/BingoCard';
import Settings from './components/Settings';
import { GAME_ITEMS, CATEGORIES} from './data/gameData';
import './styles.css';

export default function App() {
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(CATEGORIES.ANIMALS);
  const [gameItems, setGameItems] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [score, setScore] = useState(0);
  const [playedWords, setPlayedWords] = useState(new Set());
  const [currentAudio, setCurrentAudio] = useState(null);
  const [wrongSelection, setWrongSelection] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [bgVolume, setBgVolume] = useState(() => 
    parseFloat(localStorage.getItem('bgVolume')) || 0.5);
  const [bgMusicTrack, setBgMusicTrack] = useState(() =>
    localStorage.getItem('bgMusicTrack') || '/music/track1.mp3');
  const bgMusicRef = useRef(new Audio(bgMusicTrack));
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(null);

  const playNextWord = () => {
    const unplayedItems = gameItems.filter(item => !playedWords.has(item.id));
    if (unplayedItems.length > 0) {
      const nextItem = unplayedItems[Math.floor(Math.random() * unplayedItems.length)];
      playWord(nextItem);
    } else {
      setIsGameComplete(true);
      saveGameData();
    }
  };
  const errorSound = useRef(new Audio('/sounds/error.mp3'));

  useEffect(() => {
    // Only initialize audio after game starts
    if (gameStarted && gameItems.length > 0) {
      gameItems.forEach(item => {
        item.audio.load();
      });
      errorSound.current.load();
      
      // Play first word after game starts
      const firstItem = gameItems[0];
      playWord(firstItem);
      setStartTime(Date.now());
    }

    return () => {
      errorSound.current.pause();
      gameItems.forEach(item => {
        item.audio.pause();
        item.audio.currentTime = 0;
      });
    };
  }, [gameStarted, gameItems]);

  useEffect(() => {
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = bgVolume;
    
    return () => {
      bgMusicRef.current.pause();
    };
  }, []);

  const handleVolumeChange = (value) => {
    setBgVolume(value);
    bgMusicRef.current.volume = value;
    localStorage.setItem('bgVolume', value);
  };
  
  const handleBgMusicChange = (track) => {
    setBgMusicTrack(track);
    bgMusicRef.current.src = track;
    bgMusicRef.current.play();
    localStorage.setItem('bgMusicTrack', track);
  };

  const startGame = () => {
    // Create new game items based on current category
    const newItems = getRandomItems(GAME_ITEMS[currentCategory], 9).map(item => ({
      ...item,
      audio: new Audio(item.audioSrc)
    }));
    
    setGameItems(newItems);
    setGameStarted(true);
    setMatches([]);
    setCurrentWord(null);
    setScore(0);
    setPlayedWords(new Set());
    setCurrentAudio(null);
    setMistakes(0);
  };

  const playWord = (selectedItem) => {
    try {
      // Stop any currently playing audio
      gameItems.forEach(item => {
        item.audio.pause();
        item.audio.currentTime = 0;
      });

      // Play new audio
      selectedItem.audio.currentTime = 0;
      const playPromise = selectedItem.audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Audio playback failed:', error);
        });
      }

      setCurrentWord(selectedItem);
      setCurrentAudio(selectedItem);
      setPlayedWords(prev => new Set([...prev, selectedItem.id]));
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const repeatWord = () => {
    if (currentWord) {
      currentWord.audio.currentTime = 0;
      currentWord.audio.play();
    }
  };

  const handleCardClick = (index) => {
    if (!currentWord) return;
    
    const selectedItem = gameItems[index];
    if (selectedItem.id === currentWord.id) {
      setMatches(prev => [...prev, index]);
      setScore(prev => prev + 1);
      setCurrentWord(null);

      // Add delay before playing next word
      setTimeout(() => {
        playNextWord();
      }, 1000); // 1 second delay
    } else {
      setWrongSelection(index);
      setMistakes(prev => prev + 1);
      
      // Clear wrong selection after animation
      setTimeout(() => {
        setWrongSelection(null);
      }, 500);

      // Wrong match - sequence the audio
      errorSound.current.play()
        .then(() => {
          // Wait for error sound to finish (about 500ms)
          return new Promise(resolve => setTimeout(resolve, 2000));
        })
        .then(() => {
          // Then play the word
          currentWord.audio.currentTime = 0;
          return currentWord.audio.play();
        })
        .catch(error => {
          console.error('Audio playback error:', error);
        });
    }
  };

  // Update resetGame function
  const resetGame = () => {
    gameItems.forEach(item => {
      item.audio.pause();
      item.audio.currentTime = 0;
    });

    const newItems = getRandomItems(GAME_ITEMS[currentCategory], 9).map(item => ({
      ...item,
      audio: new Audio(item.audioSrc)
    }));

    setGameItems(newItems);
    setMatches([]);
    setCurrentWord(null);
    setScore(0);
    setPlayedWords(new Set());
    setCurrentAudio(null);
    setMistakes(0);
  };

  const saveGameData = async () => {
    const userId = 'user-id-placeholder'; // Replace with actual user ID
    const timeTaken = Math.floor((Date.now() - startTime) / 1000); // Time in seconds

    try {
      const response = await axios.post('http://localhost:5000/api/gameData/save', {
        userId,
        score,
        category: currentCategory,
        mistakes,
        timeTaken
      });
      console.log(response.data.message);
    } catch (error) {
      console.error('Failed to save game data:', error);
    }
  };

  return (
    <div className="bg-animated">
    <div className="bg-overlay"></div>
    <div className="content">
      <div className="min-h-screen bg-gray-100 p-4">
        {!gameStarted ? (
          <div className="start-screen">
          <h1 className="title">Audio Image Match</h1>
          <div className="button-container">
            <button onClick={startGame} className="play-button">
              Start Game
            </button>
            <button 
              onClick={() => setShowSettings(true)} 
              className="settings-button"
            >
              Settings
            </button>
          </div>
          <Settings 
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            volume={bgVolume}
            onVolumeChange={handleVolumeChange}
            bgMusic={bgMusicTrack}
            onBgMusicChange={handleBgMusicChange}
            category={currentCategory}
            onCategoryChange={(category) => {
              setCurrentCategory(category);
              resetGame();
            }}
            categories={CATEGORIES}
          />
        </div>
          
        ) : (
          <div className="max-w-2xl mx-auto">

            <header className="text-center mb-6">
              <h1>AUDIO IMAGE MATCH</h1>
              <div className="score-display">SCORE: {score}</div>
            </header>

            <div className="controls">
              <button 
                onClick={repeatWord}
                disabled={!currentWord}
                className="play-button"
              >
                🔊 REPEAT
              </button>
            </div>

            <BingoCard 
              items={gameItems}
              matches={matches}
              onCardClick={handleCardClick}
              currentWord={currentWord}
              wrongSelection={wrongSelection}
            />

            <div className="text-center mt-4">
              <button 
                onClick={resetGame}
                className="new-game-button"
              >
                New Game
              </button>
              <button 
                onClick={() => {
                  resetGame();
                  setGameStarted(false);
                }}
                className="new-game-button bg-red-500"
              >
                Exit
              </button>
            </div>
          </div>
        )}
        {isGameComplete && (
          <GameCompletionModal 
          onNewGame={() => {
            setIsGameComplete(false);
            resetGame();
          }}
          onExit={() => {
            setIsGameComplete(false);
            resetGame();
            setGameStarted(false);
          }}
        />
      )}
      </div>
      </div>
    </div>
  );
}

function getRandomItems(items, count) {
  if (!Array.isArray(items)) {
    console.error('Items must be an array');
    return [];
  }
  return [...items]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);
}
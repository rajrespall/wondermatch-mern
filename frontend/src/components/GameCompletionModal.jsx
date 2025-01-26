export default function GameCompletionModal({ onNewGame, onExit }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>GAME COMPLETE!</h2>
        <p>PLAY AGAIN?</p>
        <div className="modal-buttons">
          <button onClick={onNewGame} className="new-game-button">
            YES
          </button>
          <button onClick={onExit} className="new-game-button bg-red-500">
            NO
          </button>
        </div>
      </div>
    </div>
  );
}
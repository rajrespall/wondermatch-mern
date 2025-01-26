export default function Settings({ isOpen, onClose, volume, onVolumeChange, bgMusic, onBgMusicChange }) {
    return isOpen ? (
      <div className="modal-overlay">
        <div className="modal-content settings-modal">
          <h2>SETTINGS</h2>
          <div className="settings-controls">
            <div className="volume-control">
              <label>Music Volume</label>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="volume-slider"
              />
            </div>
            <div className="music-select">
              <label>Background Music</label>
              <select 
                value={bgMusic} 
                onChange={(e) => onBgMusicChange(e.target.value)}
                className="music-dropdown"
              >
                <option value="/sounds/track1.mp3">Track 1</option>
                <option value="/sounds/track2.mp3">Track 2</option>
                <option value="/sounds/track3.mp3">Track 3</option>
              </select>
            </div>
          </div>
          <button onClick={onClose} className="new-game-button">
            CLOSE
          </button>
        </div>
      </div>
    ) : null;
  }
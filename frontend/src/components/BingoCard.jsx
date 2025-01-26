export default function BingoCard({ items, matches, onCardClick, currentWord, wrongSelection }) {
  return (
    <div className="grid-container">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`flip-card ${matches.includes(index) ? 'matched' : ''} ${
            wrongSelection === index ? 'wrong-selection' : ''
          }`}
          onClick={() => onCardClick(index)}
        >
          <div className="flip-card-inner">
            <div className="flip-card-front">
              <img src={item.image} alt={item.word} draggable="false" />
            </div>
            <div className="flip-card-back">
              <span className="text-2xl font-bold">{item.word}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
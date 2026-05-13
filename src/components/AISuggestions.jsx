import styles from "./AISuggestions.module.css";

function AISuggestions({ suggestions }) {

  const parsed = suggestions
    ? suggestions
      .split("\n")
      .filter((s) => s.trim() !== "")
    : [];

  return (
    <div className={styles.aiContainer}>

      {/* HEADER */}
      <div className={styles.header}>
        <h2>🤖 AI Suggestions</h2>
        <p>Smart recommendations for better productivity</p>
      </div>

      {/* EMPTY STATE */}
      {parsed.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No suggestions yet</p>
          <span>
            Generate an AI plan to get recommendations
          </span>
        </div>
      ) : (
        <div className={styles.suggestionsList}>
          {parsed.map((s, i) => (
            <div
              key={i}
              className={styles.suggestionCard}
            >
              <div className={styles.icon}>
                💡
              </div>

              <p className={styles.text}>
                {s}
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default AISuggestions;
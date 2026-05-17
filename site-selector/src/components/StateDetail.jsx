import * as d3 from 'd3';
import { STATE_DATA, FACTORS } from '../data/stateData';

function scoreColor(score) {
  return d3.scaleSequential().domain([1, 10]).interpolator(d3.interpolateRdYlGn)(score);
}

function ScoreBar({ score, color }) {
  return (
    <div className="score-bar-wrap">
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${(score / 10) * 100}%`, backgroundColor: color }}
        />
      </div>
      <span className="score-bar-num" style={{ color }}>
        {score}/10
      </span>
    </div>
  );
}

export default function StateDetail({ abbr, enabled, computeScore }) {
  if (!abbr) {
    return (
      <div className="state-detail state-detail-empty">
        <div className="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 13l4.553 2.276A1 1 0 0021 21.382V10.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0L9 4" />
          </svg>
        </div>
        <p>Click any state on the map to view detailed site-selection criteria.</p>
      </div>
    );
  }

  const state = STATE_DATA[abbr];
  if (!state) return null;

  const composite = computeScore(abbr);
  const compositeColor = scoreColor(composite);
  const activeFactors = FACTORS.filter((f) => enabled[f.key]);

  return (
    <div className="state-detail">
      <div className="state-detail-header">
        <div className="state-abbr-badge">{abbr}</div>
        <div className="state-title-block">
          <h2 className="state-name">{state.name}</h2>
          <div className="state-rto">{state.rto}</div>
        </div>
        <div
          className="composite-score-circle"
          style={{ borderColor: compositeColor, color: compositeColor }}
        >
          <span className="cs-num">{composite !== null ? composite.toFixed(1) : '–'}</span>
          <span className="cs-label">score</span>
        </div>
      </div>

      <p className="state-headline">{state.headline}</p>

      {activeFactors.length === 0 && (
        <div className="no-factors-msg">Enable at least one criterion to see scores.</div>
      )}

      <div className="factor-scores">
        {activeFactors.map((factor) => {
          const score = state.scores[factor.key];
          const color = scoreColor(score);
          return (
            <div key={factor.key} className="factor-score-row">
              <div className="fsr-header">
                <span className="fsr-name" style={{ color: factor.color }}>
                  {factor.label}
                </span>
              </div>
              <ScoreBar score={score} color={color} />
              <p className="fsr-note">{state.notes[factor.key]}</p>
            </div>
          );
        })}
      </div>

      {activeFactors.length > 0 && (
        <div className="inactive-factors">
          {FACTORS.filter((f) => !enabled[f.key]).map((factor) => (
            <div key={factor.key} className="inactive-factor-row">
              <span className="ifr-name">{factor.label}</span>
              <span className="ifr-disabled">disabled</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

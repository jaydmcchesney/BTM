import { useState, useCallback } from 'react';
import USMap from './components/USMap';
import FilterPanel from './components/FilterPanel';
import StateDetail from './components/StateDetail';
import { FACTORS, STATE_DATA } from './data/stateData';
import './App.css';

const initialEnabled = Object.fromEntries(FACTORS.map((f) => [f.key, true]));
const initialWeights = Object.fromEntries(FACTORS.map((f) => [f.key, 1]));

export default function App() {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [weights, setWeights] = useState(initialWeights);
  const [selectedState, setSelectedState] = useState(null);

  const handleToggle = useCallback((key, forceOn) => {
    setEnabled((prev) => ({
      ...prev,
      [key]: forceOn !== undefined ? true : !prev[key],
    }));
  }, []);

  const handleWeight = useCallback((key, value) => {
    setWeights((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setEnabled(initialEnabled);
    setWeights(initialWeights);
  }, []);

  const computeScore = useCallback(
    (abbr) => {
      const state = STATE_DATA[abbr];
      if (!state) return null;
      const active = FACTORS.filter((f) => enabled[f.key]);
      if (active.length === 0) return null;
      const totalWeight = active.reduce((s, f) => s + weights[f.key], 0);
      const weightedSum = active.reduce(
        (s, f) => s + state.scores[f.key] * weights[f.key],
        0
      );
      return weightedSum / totalWeight;
    },
    [enabled, weights]
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="header-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          </div>
          <div>
            <h1 className="app-title">BTM Data Center Site Selector</h1>
            <p className="app-subtitle">
              United States · Behind-the-Meter Natural Gas Generation · Site Scoring
            </p>
          </div>
        </div>
        <div className="header-right">
          <span className="header-note">
            Scores reflect regulatory clarity, market conditions, and policy environment as of early 2025.
          </span>
        </div>
      </header>

      <div className="app-body">
        <FilterPanel
          enabled={enabled}
          weights={weights}
          onToggle={handleToggle}
          onWeight={handleWeight}
          onReset={handleReset}
        />

        <main className="map-main">
          <USMap
            computeScore={computeScore}
            selectedState={selectedState}
            onSelectState={setSelectedState}
          />
        </main>

        <StateDetail
          abbr={selectedState}
          enabled={enabled}
          computeScore={computeScore}
        />
      </div>
    </div>
  );
}

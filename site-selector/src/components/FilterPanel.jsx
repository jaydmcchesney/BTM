import { FACTORS } from '../data/stateData';

export default function FilterPanel({ enabled, weights, onToggle, onWeight, onReset }) {
  const activeCount = FACTORS.filter((f) => enabled[f.key]).length;

  return (
    <aside className="filter-panel">
      <div className="filter-header">
        <h2>Site Criteria</h2>
        <p className="filter-subtitle">
          Toggle factors on/off and adjust their relative weight to customize the composite score.
        </p>
      </div>

      <div className="factor-list">
        {FACTORS.map((factor) => {
          const isOn = enabled[factor.key];
          const w = weights[factor.key];
          return (
            <div key={factor.key} className={`factor-card${isOn ? ' factor-on' : ' factor-off'}`}>
              <div className="factor-top">
                <button
                  className={`toggle-btn${isOn ? ' toggle-on' : ''}`}
                  onClick={() => onToggle(factor.key)}
                  aria-label={`${isOn ? 'Disable' : 'Enable'} ${factor.label}`}
                  style={{ '--accent': factor.color }}
                >
                  <span className="toggle-track">
                    <span className="toggle-thumb" />
                  </span>
                </button>
                <div className="factor-info">
                  <div className="factor-name" style={{ color: isOn ? factor.color : '#64748b' }}>
                    {factor.label}
                  </div>
                </div>
              </div>

              {isOn && (
                <div className="factor-weight">
                  <div className="weight-label-row">
                    <span className="weight-label">Weight</span>
                    <span className="weight-value">{w}×</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={w}
                    onChange={(e) => onWeight(factor.key, Number(e.target.value))}
                    className="weight-slider"
                    style={{ '--accent': factor.color }}
                  />
                  <div className="weight-ticks">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <span key={v} className={v === w ? 'tick-active' : ''}>{v}</span>
                    ))}
                  </div>
                </div>
              )}

              <p className="factor-desc">{factor.description}</p>
            </div>
          );
        })}
      </div>

      <div className="filter-footer">
        <div className="active-count">
          <span className="count-num">{activeCount}</span>
          <span className="count-label"> / {FACTORS.length} criteria active</span>
        </div>
        <button
          className="reset-btn"
          onClick={onReset}
        >
          Reset All
        </button>
      </div>
    </aside>
  );
}

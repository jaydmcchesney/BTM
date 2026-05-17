import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { FIPS_TO_ABBR, STATE_DATA } from '../data/stateData';

const WIDTH = 975;
const HEIGHT = 610;
const US_ATLAS_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

function getColor(score) {
  if (score === null || score === undefined) return '#334155';
  return d3.scaleSequential().domain([1, 10]).interpolator(d3.interpolateRdYlGn)(score);
}

export default function USMap({ computeScore, selectedState, onSelectState }) {
  const [geoData, setGeoData] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, abbr: null });
  const svgRef = useRef(null);

  useEffect(() => {
    const projection = d3.geoAlbersUsa().scale(1300).translate([WIDTH / 2, HEIGHT / 2]);
    const pathGen = d3.geoPath().projection(projection);

    fetch(US_ATLAS_URL)
      .then((r) => r.json())
      .then((us) => {
        const features = topojson.feature(us, us.objects.states).features;
        const border = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
        const paths = features.map((f) => ({
          fips: String(f.id).padStart(2, '0'),
          d: pathGen(f),
          centroid: pathGen.centroid(f),
        }));
        setGeoData({ paths, borderD: pathGen(border) });
      })
      .catch(() => setGeoData({ paths: [], borderD: '' }));
  }, []);

  const handleMouseMove = useCallback((e, abbr) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTooltip({
      visible: true,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      abbr,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
  }, []);

  if (!geoData) {
    return (
      <div className="map-loading">
        <div className="spinner" />
        <span>Loading map data…</span>
      </div>
    );
  }

  const tooltipState = tooltip.abbr ? STATE_DATA[tooltip.abbr] : null;
  const tooltipScore = tooltip.abbr ? computeScore(tooltip.abbr) : null;

  return (
    <div className="map-container" ref={svgRef}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
        className="us-map-svg"
      >
        <g>
          {geoData.paths.map(({ fips, d }) => {
            const abbr = FIPS_TO_ABBR[fips];
            if (!abbr || !d) return null;
            const score = computeScore(abbr);
            const isSelected = selectedState === abbr;
            return (
              <path
                key={fips}
                d={d}
                fill={getColor(score)}
                className={`state-path${isSelected ? ' selected' : ''}`}
                onClick={() => onSelectState(abbr === selectedState ? null : abbr)}
                onMouseMove={(e) => handleMouseMove(e, abbr)}
                onMouseLeave={handleMouseLeave}
              />
            );
          })}
          <path
            d={geoData.borderD}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={0.6}
            pointerEvents="none"
          />
          {/* Highlight ring for selected state */}
          {selectedState &&
            geoData.paths
              .filter(({ fips }) => FIPS_TO_ABBR[fips] === selectedState)
              .map(({ fips, d }) => (
                <path
                  key={`sel-${fips}`}
                  d={d}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={2.5}
                  pointerEvents="none"
                />
              ))}
        </g>
      </svg>

      {/* Hover tooltip */}
      {tooltip.visible && tooltipState && (
        <div
          className="map-tooltip"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 10,
          }}
        >
          <div className="tooltip-name">{tooltipState.name}</div>
          <div className="tooltip-rto">{tooltipState.rto}</div>
          {tooltipScore !== null && (
            <div
              className="tooltip-score"
              style={{ color: getColor(tooltipScore) }}
            >
              Score: {tooltipScore.toFixed(1)} / 10
            </div>
          )}
          <div className="tooltip-hint">Click for details</div>
        </div>
      )}

      {/* Legend */}
      <Legend />
    </div>
  );
}

function Legend() {
  const stops = 10;
  return (
    <div className="map-legend">
      <div className="legend-label-row">
        <span>Unfavorable</span>
        <span>Favorable</span>
      </div>
      <div className="legend-gradient">
        {Array.from({ length: stops }, (_, i) => {
          const v = 1 + (i / (stops - 1)) * 9;
          return (
            <div
              key={i}
              className="legend-swatch"
              style={{ backgroundColor: getColor(v) }}
            />
          );
        })}
      </div>
      <div className="legend-tick-row">
        <span>1</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}

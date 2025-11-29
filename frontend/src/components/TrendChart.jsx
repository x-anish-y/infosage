import { useEffect, useRef, useState } from 'react';
import './TrendChart.css';

export function TrendChart({ data = [], claimId }) {
  const canvasRef = useRef(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState(null);
  const [displayMetrics, setDisplayMetrics] = useState(['mentions', 'engagement', 'sources']);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Ensure data is properly formatted
  const validData = data.filter(d => {
    const dateObj = d.t instanceof Date ? d.t : new Date(d.t);
    return !isNaN(dateObj.getTime()) && d.count !== undefined;
  }).map(d => ({
    ...d,
    t: d.t instanceof Date ? d.t : new Date(d.t)
  }));

  // Get AI recommendation on which metrics to display
  useEffect(() => {
    if (validData.length === 0) return;

    const getMetricsRecommendation = async () => {
      setLoadingAnalysis(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000'}/api/analysis/recommend-metrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            claimId,
            dataPoints: validData.length,
            hasEngagement: validData.some(d => d.engagement !== undefined),
            hasSources: validData.some(d => d.sources !== undefined),
            hasTrend: validData.some(d => d.trend !== undefined),
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setDisplayMetrics(result.recommendedMetrics || ['mentions', 'engagement', 'sources']);
          setAiAnalysis(result.analysis);
        }
      } catch (error) {
        console.error('Error getting AI recommendation:', error);
        // Use defaults if error
      } finally {
        setLoadingAnalysis(false);
      }
    };

    getMetricsRecommendation();
  }, [validData, claimId]);

  useEffect(() => {
    if (!canvasRef.current || validData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    
    // Set canvas size
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Draw background grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Calculate max values for each metric
    const getMaxValue = (metric) => {
      const values = validData.map(d => d[metric] || 0);
      return Math.max(...values, 100);
    };

    const maxMentions = getMaxValue('count');
    const maxEngagement = Math.max(...validData.map(d => (d.engagement || 0) * 100), 100);
    const maxSources = getMaxValue('sources');

    // Define colors for each metric
    const metricColors = {
      mentions: { line: '#3b82f6', fill: 'rgba(59, 130, 246, 0.1)' },
      engagement: { line: '#10b981', fill: 'rgba(16, 185, 129, 0.1)' },
      sources: { line: '#f59e0b', fill: 'rgba(245, 158, 11, 0.1)' },
    };

    // Draw metrics
    displayMetrics.forEach((metric, idx) => {
      const color = metricColors[metric];
      if (!color) return;

      let maxValue;
      let dataExtractor;

      if (metric === 'mentions') {
        maxValue = maxMentions;
        dataExtractor = (d) => d.count || 0;
      } else if (metric === 'engagement') {
        maxValue = maxEngagement;
        dataExtractor = (d) => (d.engagement || 0) * 100;
      } else if (metric === 'sources') {
        maxValue = maxSources;
        dataExtractor = (d) => d.sources || 0;
      }

      // Draw line
      ctx.strokeStyle = color.line;
      ctx.lineWidth = 2 + idx * 0.5; // Slightly different widths for visibility
      ctx.beginPath();

      validData.forEach((item, i) => {
        const x = padding + (chartWidth / (validData.length - 1)) * i;
        const value = dataExtractor(item);
        const y = height - padding - (chartHeight * value) / maxValue;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });

      ctx.stroke();

      // Draw points for primary metric
      if (idx === 0) {
        ctx.fillStyle = color.line;
        validData.forEach((item, i) => {
          const x = padding + (chartWidth / (validData.length - 1)) * i;
          const value = dataExtractor(item);
          const y = height - padding - (chartHeight * value) / maxValue;

          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();

          // Draw point outline
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
    });

    // Draw Y axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = Math.floor((maxMentions / 5) * i);
      const y = height - padding - (chartHeight / 5) * i;
      ctx.fillText(value, padding - 10, y + 4);
    }

    // Draw Y axis labels for engagement (right side)
    if (displayMetrics.includes('engagement')) {
      ctx.fillStyle = '#10b981';
      ctx.textAlign = 'left';
      for (let i = 0; i <= 5; i++) {
        const value = Math.floor((maxEngagement / 5) * i);
        const y = height - padding - (chartHeight / 5) * i;
        ctx.fillText(value + '%', width - padding + 10, y + 4);
      }
    }

    // Draw Y axis labels
    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3b82f6';
    ctx.font = 'bold 12px system-ui';
    ctx.fillText('Mentions', 0, 0);
    ctx.restore();

    // Draw engagement axis label (right side)
    if (displayMetrics.includes('engagement')) {
      ctx.save();
      ctx.translate(width - 15, height / 2);
      ctx.rotate(Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 12px system-ui';
      ctx.fillText('Engagement', 0, 0);
      ctx.restore();
    }

    // Draw X axis labels (times)
    ctx.fillStyle = '#6b7280';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    for (let i = 0; i < validData.length; i += Math.ceil(validData.length / 6)) {
      if (validData[i] && validData[i].t) {
        const x = padding + (chartWidth / (validData.length - 1)) * i;
        const timeObj = validData[i].t instanceof Date ? validData[i].t : new Date(validData[i].t);
        
        // Check if date is valid
        if (!isNaN(timeObj.getTime())) {
          const label = `${String(timeObj.getHours()).padStart(2, '0')}:${String(timeObj.getMinutes()).padStart(2, '0')}`;
          ctx.fillText(label, x, height - padding + 20);
        }
      }
    }

    // Draw X axis label
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 12px system-ui';
    ctx.fillText('Time (hours)', width / 2, height - 10);
    ctx.restore();

    // Draw legend
    const legendX = width - 250;
    const legendY = padding + 10;
    ctx.font = '12px system-ui';
    displayMetrics.forEach((metric, idx) => {
      const color = metricColors[metric];
      ctx.fillStyle = color.line;
      ctx.fillRect(legendX, legendY + idx * 20, 15, 15);
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'left';
      ctx.fillText(metric.charAt(0).toUpperCase() + metric.slice(1), legendX + 20, legendY + idx * 20 + 12);
    });

    // Mouse move handler for tooltip
    const handleMouseMove = (e) => {
      const canvasRect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      // Find closest point
      let closest = null;
      let closestDist = 15; // Hover radius

      validData.forEach((item, idx) => {
        const x = padding + (chartWidth / (validData.length - 1)) * idx;
        const y = height - padding - (chartHeight * (item.count || 0)) / maxMentions;
        const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);

        if (dist < closestDist) {
          closestDist = dist;
          closest = { idx, x, y, item, dist };
        }
      });

      if (closest) {
        setHoveredPoint(closest);
        setTooltipPos({
          x: closest.x + canvasRect.left,
          y: closest.y + canvasRect.top,
        });
      } else {
        setHoveredPoint(null);
        setTooltipPos(null);
      }
    };

    const handleMouseLeave = () => {
      setHoveredPoint(null);
      setTooltipPos(null);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [validData]);

  return (
    <div className="trend-chart-container">
      <h3>Mentions Over Time (72 Hours)</h3>
      <div style={{ position: 'relative', width: '100%' }}>
        <canvas 
          ref={canvasRef} 
          className="trend-chart"
          style={{ cursor: 'crosshair' }}
        />
        {hoveredPoint && tooltipPos && (
          <div
            className="trend-tooltip"
            style={{
              left: `${tooltipPos.x + 10}px`,
              top: `${tooltipPos.y - 100}px`,
            }}
          >
            <div className="tooltip-time">
              {hoveredPoint.item.t instanceof Date 
                ? hoveredPoint.item.t.toLocaleString()
                : new Date(hoveredPoint.item.t).toLocaleString()
              }
            </div>
            <div className="tooltip-mentions">
              {displayMetrics.includes('mentions') && (
                <><strong>Mentions:</strong> {hoveredPoint.item.count || 0}<br /></>
              )}
            </div>
            {displayMetrics.includes('sources') && hoveredPoint.item.sources && (
              <div className="tooltip-sources">
                <strong>Sources:</strong> {hoveredPoint.item.sources}
              </div>
            )}
            {displayMetrics.includes('engagement') && hoveredPoint.item.engagement !== undefined && (
              <div className="tooltip-engagement">
                <strong>Engagement:</strong> {(hoveredPoint.item.engagement * 100).toFixed(0)}%
              </div>
            )}
            {hoveredPoint.item.trend && (
              <div className={`tooltip-trend trend-${hoveredPoint.item.trend}`}>
                <strong>Trend:</strong> {hoveredPoint.item.trend}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

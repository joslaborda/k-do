import { useState, useCallback, useEffect, useRef } from 'react';

export default function OTabBar({ tabs, activeKey, onChange, urgentCount = 0 }) {
  const containerRef = useRef(null);
  const [lineStyle, setLineStyle] = useState({ left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  const updateLine = useCallback(() => {
    if (!containerRef.current) return;
    const idx = tabs.findIndex(t => t.key === activeKey);
    const buttons = containerRef.current.querySelectorAll('button');
    const btn = buttons[idx];
    if (!btn) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const labelEl = btn.querySelector('.tab-label');
    const labelRect = labelEl ? labelEl.getBoundingClientRect() : btn.getBoundingClientRect();
    setLineStyle({
      left: labelRect.left - containerRect.left,
      width: labelRect.width,
    });
  }, [activeKey, tabs]);

  useEffect(() => {
    updateLine();
    if (!mounted) setTimeout(() => setMounted(true), 50);
  }, [updateLine, mounted]);

  useEffect(() => {
    const observer = new ResizeObserver(() => updateLine());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [updateLine]);

  return (
    <div ref={containerRef} role="tablist" aria-label="Secciones del viaje" className="relative flex" style={{ position: 'relative' }}>
      {/* Single sliding line — top */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: lineStyle.left,
        width: lineStyle.width,
        height: 3,
        background: 'hsl(var(--primary))',
        borderRadius: 2,
        transition: mounted ? 'left 0.25s cubic-bezier(.4,0,.2,1), width 0.25s cubic-bezier(.4,0,.2,1)' : 'none',
      }} />
      {tabs.map(tab => {
        const isOn = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            role="tab"
            aria-selected={isOn}
            onClick={() => onChange(tab.key)}
            className="flex-1 flex flex-col items-center pt-3 pb-2.5 gap-1"
          >
            <span
              className="tab-label"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: isOn ? 'var(--kodo-text-active)' : 'var(--kodo-nav-inactive)',
                transition: 'color 0.2s',
                lineHeight: 1,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span style={{
                  background: 'hsl(var(--primary))', color: 'white',
                  fontSize: 10, fontWeight: 500, borderRadius: 10,
                  padding: '1px 5px',
                }}>{tab.badge}</span>
              )}
              {tab.urgent && urgentCount > 0 && !isOn && (
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: 'hsl(var(--primary))',
                  display: 'inline-block', flexShrink: 0,
                }} />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

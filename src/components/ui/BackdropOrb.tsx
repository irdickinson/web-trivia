export function BackdropOrb() {
  return (
    <div className="orb-backdrop" aria-hidden="true">
      <div className="orb-core" />
      <div className="orb-ring" />
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="orb-particle"
          style={{
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  )
}

// Deterministic particle positions — avoids hydration issues and randomness on re-render
const PARTICLES = [
  { x: '48%',  y: '52%', size: '3px', dur: 14, delay: 0,    opacity: 0.55 },
  { x: '44%',  y: '46%', size: '2px', dur: 18, delay: 2.5,  opacity: 0.4  },
  { x: '53%',  y: '55%', size: '2px', dur: 11, delay: 1,    opacity: 0.5  },
  { x: '50%',  y: '40%', size: '4px', dur: 20, delay: 3,    opacity: 0.35 },
  { x: '38%',  y: '50%', size: '2px', dur: 16, delay: 0.5,  opacity: 0.45 },
  { x: '62%',  y: '48%', size: '3px', dur: 13, delay: 4,    opacity: 0.5  },
  { x: '46%',  y: '60%', size: '2px', dur: 22, delay: 1.5,  opacity: 0.3  },
  { x: '56%',  y: '43%', size: '2px', dur: 17, delay: 6,    opacity: 0.4  },
  { x: '41%',  y: '57%', size: '3px', dur: 12, delay: 2,    opacity: 0.45 },
  { x: '59%',  y: '54%', size: '2px', dur: 19, delay: 7,    opacity: 0.35 },
  { x: '52%',  y: '36%', size: '3px', dur: 15, delay: 3.5,  opacity: 0.5  },
  { x: '35%',  y: '45%', size: '2px', dur: 24, delay: 1,    opacity: 0.3  },
  { x: '65%',  y: '52%', size: '2px', dur: 10, delay: 5,    opacity: 0.4  },
  { x: '47%',  y: '66%', size: '3px', dur: 21, delay: 0.8,  opacity: 0.3  },
  { x: '55%',  y: '38%', size: '2px', dur: 16, delay: 4.5,  opacity: 0.45 },
]

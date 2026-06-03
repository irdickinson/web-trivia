export function BackdropOrb() {
  return (
    <div className="orb-backdrop" aria-hidden="true">
      <div className="orb-ambient" />
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

const PARTICLES = [
  { x: '48%', y: '45%', size: '3px', dur: 14, delay: 0,   opacity: 0.80 },
  { x: '42%', y: '38%', size: '2px', dur: 18, delay: 2.5, opacity: 0.65 },
  { x: '55%', y: '48%', size: '3px', dur: 11, delay: 1,   opacity: 0.75 },
  { x: '52%', y: '30%', size: '4px', dur: 20, delay: 3,   opacity: 0.60 },
  { x: '35%', y: '44%', size: '2px', dur: 16, delay: 0.5, opacity: 0.70 },
  { x: '65%', y: '42%', size: '3px', dur: 13, delay: 4,   opacity: 0.75 },
  { x: '45%', y: '58%', size: '2px', dur: 22, delay: 1.5, opacity: 0.55 },
  { x: '58%', y: '36%', size: '2px', dur: 17, delay: 6,   opacity: 0.65 },
  { x: '38%', y: '54%', size: '3px', dur: 12, delay: 2,   opacity: 0.70 },
  { x: '62%', y: '52%', size: '2px', dur: 19, delay: 7,   opacity: 0.60 },
  { x: '50%', y: '28%', size: '3px', dur: 15, delay: 3.5, opacity: 0.75 },
  { x: '30%', y: '40%', size: '2px', dur: 24, delay: 1,   opacity: 0.55 },
  { x: '70%', y: '48%', size: '2px', dur: 10, delay: 5,   opacity: 0.70 },
  { x: '44%', y: '64%', size: '3px', dur: 21, delay: 0.8, opacity: 0.50 },
  { x: '57%', y: '32%', size: '2px', dur: 16, delay: 4.5, opacity: 0.70 },
  { x: '72%', y: '38%', size: '2px', dur: 19, delay: 3.2, opacity: 0.60 },
  { x: '28%', y: '52%', size: '3px', dur: 14, delay: 7.5, opacity: 0.55 },
  { x: '54%', y: '22%', size: '2px', dur: 23, delay: 2.2, opacity: 0.65 },
  { x: '40%', y: '68%', size: '2px', dur: 16, delay: 5.8, opacity: 0.45 },
  { x: '63%', y: '30%', size: '3px', dur: 12, delay: 1.3, opacity: 0.75 },
]

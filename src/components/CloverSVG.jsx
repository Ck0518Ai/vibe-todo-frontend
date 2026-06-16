import { getCategoryCompletion } from '../utils/categories';

export default function CloverSVG({ cats, dateStr, todos, size = 28 }) {
  const cx = 16;
  const cy = 16;

  if (cats.length === 0) {
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
        <title>카테고리 없음</title>
      </svg>
    );
  }

  if (cats.length === 1) {
    const cat = cats[0];
    const filled = getCategoryCompletion(dateStr, cat.id, todos);
    return (
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
        <ellipse
          cx={cx}
          cy={cy}
          rx="7"
          ry="8.5"
          fill={filled ? cat.color : 'transparent'}
          stroke={cat.color}
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden>
      {cats.map((cat, i) => {
        const angle = (360 / cats.length) * i - 90;
        const filled = getCategoryCompletion(dateStr, cat.id, todos);
        return (
          <g key={cat.id} transform={`rotate(${angle} ${cx} ${cy})`}>
            <ellipse
              cx={cx}
              cy={cy - 6}
              rx="5.5"
              ry="7"
              fill={filled ? cat.color : 'transparent'}
              stroke={cat.color}
              strokeWidth="1.5"
            />
          </g>
        );
      })}
      <circle cx="16" cy="16" r="2" fill="#333" />
    </svg>
  );
}

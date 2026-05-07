export const chartTheme = {
  line: '#3461ff',
  lineSoft: '#5b8bff',
  grid: '#192246',
  axis: '#566688',
  tooltip: {
    background: '#0a1024',
    border: '1px solid #192246',
    borderRadius: '14px',
    fontSize: '12px',
    color: '#e6ecff',
    padding: '8px 12px',
  },
  axisTick: { fontSize: 10, fill: '#566688' },
} as const;

export const ROYAL_GRADIENT_ID = 'royal-gradient';

/**
 * Drop into a Recharts <defs> block to get a royal-blue area fill that fades to transparent.
 */
export function RoyalAreaGradient({ id = ROYAL_GRADIENT_ID }: { id?: string }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#3461ff" stopOpacity={0.45} />
      <stop offset="100%" stopColor="#3461ff" stopOpacity={0} />
    </linearGradient>
  );
}

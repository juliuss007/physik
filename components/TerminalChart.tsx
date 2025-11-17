interface TerminalChartProps {
  data: Array<{ label: string; value: number }>;
  maxValue?: number;
  barChar?: string;
}

export function TerminalChart({ data, maxValue, barChar = "█" }: TerminalChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value));
  const maxBarLength = 40;

  return (
    <div className="font-mono text-[0.7rem] space-y-2">
      {data.map((item, index) => {
        const barLength = max > 0 ? Math.round((item.value / max) * maxBarLength) : 0;
        const bar = barChar.repeat(barLength);

        return (
          <div key={index} className="flex items-center gap-3">
            <span className="spec-label w-20 text-right shrink-0">{item.label}</span>
            <span className="text-primary">{bar}</span>
            <span className="text-muted-foreground tabular-nums ml-auto">{String(item.value).padStart(3, '0')}</span>
          </div>
        );
      })}
    </div>
  );
}

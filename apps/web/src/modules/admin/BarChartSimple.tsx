type Item = { label: string; value: number };

type Props = {
  items: Item[];
  title?: string;
};

export function BarChartSimple({ items, title }: Props) {
  if (items.length === 0) {
    return <p>Sin datos para graficar.</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="bar-chart">
      {title ? <h3 className="bar-chart__title">{title}</h3> : null}
      {items.map((item) => (
        <div key={item.label} className="bar-chart__row">
          <span className="bar-chart__label">{item.label}</span>
          <div className="bar-chart__track" aria-hidden="true">
            <div
              className="bar-chart__fill"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
          <span className="bar-chart__value">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

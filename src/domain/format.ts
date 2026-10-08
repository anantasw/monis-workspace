const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

/** "$6", "$6.50": whole dollars drop the ".00". */
export function formatUsd(cents: number): string {
  const text = usd.format(cents / 100);
  return text.endsWith(".00") ? text.slice(0, -3) : text;
}

export function pluralize(count: number, one: string, many = `${one}s`): string {
  return `${count} ${count === 1 ? one : many}`;
}

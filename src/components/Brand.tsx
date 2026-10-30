import Link from "next/link";
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Convoca Perú, inicio">
      <svg
        className="brand-symbol"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="12" fill="currentColor" />
        <path
          d="M25 12H14v16h11M20 20h10m-4-4 4 4-4 4"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        convoca
        <span className="brand-country">
          PERÚ
          <span className="flag">
            <i />
            <i />
            <i />
          </span>
        </span>
      </span>
    </Link>
  );
}

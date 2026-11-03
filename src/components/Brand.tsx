import Link from "next/link";
export function Brand() {
  return (
    <Link className="brand" href="/" aria-label="Convoca Perú, inicio">
      <svg
        className="brand-symbol"
        viewBox="0 0 64 64"
        fill="none"
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="15" fill="#192E4C" />
        <path
          d="M42 19a18 18 0 1 0 0 26"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="m29 34 7 7 15-19m-9 0h9v9"
          stroke="#FFA98F"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span>
        Convoca
        <span className="brand-dot" aria-hidden="true">
          .
        </span>
        <span className="brand-country">PERÚ · OPORTUNIDADES</span>
      </span>
    </Link>
  );
}

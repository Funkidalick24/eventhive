import type { SVGProps } from "react";

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 2v3M16 2v3" />
      <path d="M3.5 9h17" />
      <path d="M5 5.5h14A2.5 2.5 0 0 1 21.5 8v12A2.5 2.5 0 0 1 19 22.5H5A2.5 2.5 0 0 1 2.5 20V8A2.5 2.5 0 0 1 5 5.5Z" />
      <path d="M7.5 12.5h3M7.5 16h3M13.5 12.5h3M13.5 16h3" />
    </svg>
  );
}

export function SparkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 2l1.4 5.2L18.6 9 13.4 10.4 12 15.6 10.6 10.4 5.4 9l5.2-1.8L12 2Z" />
      <path d="M19 13l.8 2.6L22 17l-2.2.4L19 20l-.8-2.6L16 17l2.2-.4L19 13Z" />
      <path d="M5 14l.8 2.6L8 18l-2.2.4L5 21l-.8-2.6L2 18l2.2-.4L5 14Z" />
    </svg>
  );
}


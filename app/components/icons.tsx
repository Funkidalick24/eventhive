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

export function GoogleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" {...props}>
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.14-3.09-.4-4.55H24v9.02h12.94c-.58 3.02-2.26 5.58-4.76 7.3l7.3 5.66c4.26-3.93 6.7-9.72 6.7-17.43Z"
      />
      <path
        fill="#FBBC05"
        d="M10.54 28.59a14.41 14.41 0 0 1-.75-4.59c0-1.6.27-3.16.75-4.59l-7.98-6.19A23.93 23.93 0 0 0 0 24c0 3.85.92 7.5 2.56 10.78l7.98-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.9-5.82l-7.3-5.66c-2.03 1.36-4.63 2.16-8.6 2.16-6.26 0-11.57-4.2-13.46-9.89l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
      <path fill="none" d="M0 0h48v48H0Z" />
    </svg>
  );
}


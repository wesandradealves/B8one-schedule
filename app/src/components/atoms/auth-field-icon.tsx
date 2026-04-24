'use client';

import styled from 'styled-components';

export type AuthFieldIconName = 'email' | 'password';

interface AuthFieldIconProps {
  name: AuthFieldIconName;
}

const IconRoot = styled.span.attrs({
  className: 'inline-flex h-4 w-4 items-center justify-center text-slate-400',
  'aria-hidden': true,
})``;

export function AuthFieldIcon({ name }: AuthFieldIconProps) {
  if (name === 'password') {
    return (
      <IconRoot>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
        >
          <rect
            x="5"
            y="10"
            width="14"
            height="10"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path
            d="M8 10V8a4 4 0 1 1 8 0v2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </IconRoot>
    );
  }

  return (
    <IconRoot>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4.5 7.5L12 13L19.5 7.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </IconRoot>
  );
}

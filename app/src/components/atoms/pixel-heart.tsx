'use client';

import styled from 'styled-components';

const PixelHeartSvg = styled.svg.attrs({
  className: 'h-3.5 w-3.5 text-brand',
  viewBox: '0 0 14 12',
  fill: 'none',
  xmlns: 'http://www.w3.org/2000/svg',
  'aria-hidden': true,
})``;

export function PixelHeart() {
  return (
    <PixelHeartSvg>
      <rect x="2" y="0" width="2" height="2" fill="currentColor" />
      <rect x="4" y="0" width="2" height="2" fill="currentColor" />
      <rect x="8" y="0" width="2" height="2" fill="currentColor" />
      <rect x="10" y="0" width="2" height="2" fill="currentColor" />
      <rect x="0" y="2" width="2" height="2" fill="currentColor" />
      <rect x="2" y="2" width="2" height="2" fill="currentColor" />
      <rect x="4" y="2" width="2" height="2" fill="currentColor" />
      <rect x="6" y="2" width="2" height="2" fill="currentColor" />
      <rect x="8" y="2" width="2" height="2" fill="currentColor" />
      <rect x="10" y="2" width="2" height="2" fill="currentColor" />
      <rect x="12" y="2" width="2" height="2" fill="currentColor" />
      <rect x="2" y="4" width="2" height="2" fill="currentColor" />
      <rect x="4" y="4" width="2" height="2" fill="currentColor" />
      <rect x="6" y="4" width="2" height="2" fill="currentColor" />
      <rect x="8" y="4" width="2" height="2" fill="currentColor" />
      <rect x="10" y="4" width="2" height="2" fill="currentColor" />
      <rect x="4" y="6" width="2" height="2" fill="currentColor" />
      <rect x="6" y="6" width="2" height="2" fill="currentColor" />
      <rect x="8" y="6" width="2" height="2" fill="currentColor" />
      <rect x="6" y="8" width="2" height="2" fill="currentColor" />
      <rect x="6" y="10" width="2" height="2" fill="currentColor" />
    </PixelHeartSvg>
  );
}

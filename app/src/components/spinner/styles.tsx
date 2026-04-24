'use client';

import styled from 'styled-components';

export const Overlay = styled.div.attrs({
  className: 'fixed inset-0 z-[9999] flex items-center justify-center bg-brand',
})``;

export const SpinnerShell = styled.div.attrs({
  className: 'relative flex h-24 w-24 items-center justify-center',
})``;

export const SpinnerRing = styled.span.attrs({
  className:
    'absolute inset-0 inline-block rounded-full border-[4px] border-solid border-white/35 border-t-white animate-spin',
})``;

export const SpinnerLogoSlot = styled.div.attrs({
  className: 'relative z-10',
})``;

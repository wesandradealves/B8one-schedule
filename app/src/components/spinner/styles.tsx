'use client';

import styled from 'styled-components';

export const Overlay = styled.div.attrs({
  className: 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[1px]',
})``;

export const Dot = styled.span.attrs({
  className: 'inline-block h-10 w-10 rounded-full border-4 border-solid border-brand border-t-transparent animate-spin',
})``;

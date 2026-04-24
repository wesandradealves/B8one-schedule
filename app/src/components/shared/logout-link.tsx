'use client';

import styled from 'styled-components';
import { useLogout } from '@/hooks/useLogout';

const LogoutButton = styled.button.attrs({
  type: 'button',
  className:
    'mt-4 text-sm font-medium text-brand underline underline-offset-2 hover:no-underline',
})``;

export function LogoutLink() {
  const handleLogout = useLogout();

  return <LogoutButton onClick={handleLogout}>Sair da conta</LogoutButton>;
}

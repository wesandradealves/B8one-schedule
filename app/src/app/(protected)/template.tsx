import type { ReactNode } from 'react';
import { ProtectedRoutesTemplate } from '@/components/templates/protected-routes-template';

interface ProtectedTemplateProps {
  children: ReactNode;
}

export default function ProtectedTemplate({ children }: ProtectedTemplateProps) {
  return <ProtectedRoutesTemplate>{children}</ProtectedRoutesTemplate>;
}

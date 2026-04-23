import type { ReactNode } from 'react';
import { PublicRoutesTemplate } from '@/components/templates/public-routes-template';

interface PublicTemplateProps {
  children: ReactNode;
}

export default function PublicTemplate({ children }: PublicTemplateProps) {
  return <PublicRoutesTemplate>{children}</PublicRoutesTemplate>;
}

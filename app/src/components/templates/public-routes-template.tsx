import styled from 'styled-components';
import type { ReactNode } from 'react';
import { PixelHeart } from '@/components/atoms/pixel-heart';
import medicalPatternBackground from '@/assets/img/seamless-medical-pattern-with-healthcare-icons-blue-background-recolorable-endless-pattern-with_806416-1048.jpg';

const PublicTemplateRoot = styled.section.attrs({
  className: 'flex min-h-screen w-full items-center justify-center px-4 py-6 sm:px-6',
})`
  background-color: var(--color-brand-50, #E9EDFF);
  background-image: url(${medicalPatternBackground.src});
  background-repeat: repeat;
  background-size: 320px 320px;
  background-position: center;
`;

const PublicTemplateFrame = styled.div.attrs({
  className:
    'flex w-full max-w-[420px] flex-col rounded-[34px] border bg-white px-6 py-6 sm:px-8 sm:py-8',
})`
  border-color: color-mix(
    in srgb,
    var(--color-background, #FFFFFF) 80%,
    transparent
  );
  box-shadow: 0 24px 60px
    color-mix(
      in srgb,
      var(--color-brand-900, #15246E) 22%,
      transparent
    );
`;

const PublicTemplateContent = styled.div.attrs({
  className: 'flex flex-1 flex-col',
})``;

const PublicTemplateFooter = styled.footer.attrs({
  className: 'mt-6 flex items-center justify-center gap-1 text-xs text-slate-500',
})``;

interface PublicRoutesTemplateProps {
  children: ReactNode;
}

export function PublicRoutesTemplate({ children }: PublicRoutesTemplateProps) {
  return (
    <PublicTemplateRoot>
      <PublicTemplateFrame>
        <PublicTemplateContent>{children}</PublicTemplateContent>
        <PublicTemplateFooter>
          <span>Feito com</span>
          <PixelHeart />
          <span>por</span>
          <a
            href="https://github.com/wesandradealves"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand underline-offset-2 hover:underline"
          >
            Wesley Alves
          </a>
        </PublicTemplateFooter>
      </PublicTemplateFrame>
    </PublicTemplateRoot>
  );
}

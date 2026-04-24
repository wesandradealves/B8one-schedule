import fs from 'node:fs';
import path from 'node:path';

const readFile = (relativePath: string): string => {
  return fs.readFileSync(path.join(process.cwd(), relativePath), 'utf-8');
};

const collectFiles = (rootPath: string): string[] => {
  const absoluteRoot = path.join(process.cwd(), rootPath);
  const queue = [absoluteRoot];
  const files: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const entries = fs.readdirSync(current, { withFileTypes: true });

    entries.forEach((entry) => {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        queue.push(absolutePath);
        return;
      }

      files.push(path.relative(process.cwd(), absolutePath));
    });
  }

  return files.sort();
};

describe('frontend architecture patterns', () => {
  const sourceFiles = collectFiles('src').filter((file) => {
    return (file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.d.ts');
  });

  it('should keep route groups with dedicated templates', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'src/app/(public)/template.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), 'src/app/(protected)/template.tsx'))).toBe(true);
  });

  it('should keep protected pages under /app subtree only', () => {
    const protectedFiles = collectFiles('src/app/(protected)');
    const protectedPages = protectedFiles.filter((file) => file.endsWith('/page.tsx'));

    const nonAppPages = protectedPages.filter((file) => !file.includes('/(protected)/app/'));
    expect(nonAppPages).toEqual([]);
  });

  it('should centralize HTTP service calls through executeRequest helper (DRY)', () => {
    const serviceFiles = [
      'src/services/auth.service.ts',
      'src/services/exams.service.ts',
      'src/services/appointments.service.ts',
    ];

    serviceFiles.forEach((serviceFile) => {
      const source = readFile(serviceFile);
      expect(source.includes('executeRequest(')).toBe(true);
      expect(source.includes('response.data')).toBe(false);
    });
  });

  it('should keep axios usage centralized in the API layer and request helper only', () => {
    const filesImportingAxios = sourceFiles.filter((file) => {
      return /from ['"]axios['"]/.test(readFile(file));
    });

    expect(filesImportingAxios).toEqual(['src/services/api.ts', 'src/utils/request.ts']);
  });

  it('should keep environment variable access centralized in utils/env.ts only', () => {
    const filesUsingProcessEnv = sourceFiles.filter((file) => {
      return readFile(file).includes('process.env');
    });

    expect(filesUsingProcessEnv).toEqual(['src/utils/env.ts']);
  });

  it('should keep interceptor bootstrapping centralized in app/providers.tsx only', () => {
    const filesCallingInterceptorSetup = sourceFiles.filter((file) => {
      return /setupApiInterceptors\s*\(/.test(readFile(file));
    });

    expect(filesCallingInterceptorSetup).toEqual(['src/app/providers.tsx']);
  });

  it('should keep protected route path literals centralized through APP_ROUTES in app pages', () => {
    const protectedAppPageFiles = sourceFiles.filter((file) => {
      return file.startsWith('src/app/(protected)/') && file.endsWith('/page.tsx');
    });

    protectedAppPageFiles.forEach((file) => {
      const source = readFile(file);

      expect(source).not.toMatch(/path:\s*['"]\/(?:app|login)/);
      expect(source).toContain('APP_ROUTES');
    });
  });

  it('should keep SEO document metadata side-effects centralized in useSeoMetadata hook', () => {
    const manualSeoSideEffects = sourceFiles.filter((file) => {
      const source = readFile(file);
      return (
        source.includes('document.title') ||
        source.includes('meta[name="description"]') ||
        source.includes("createElement('meta')")
      );
    });

    expect(manualSeoSideEffects).toEqual(['src/hooks/useSeoMetadata.ts']);
  });

  it('should keep auth flow state centralized through zustand + dedicated hook', () => {
    const storeSource = readFile('src/hooks/useAuthFlow.store.ts');
    const hookSource = readFile('src/hooks/useAuthFlow.ts');

    expect(storeSource).toContain("from 'zustand'");
    expect(storeSource).toContain('create<AuthFlowStoreState>');
    expect(hookSource).toContain('useAuthFlowStore');
  });

  it('should keep auth UI composition based on atomic building blocks', () => {
    const authFlowSource = readFile(
      'src/components/organisms/auth/auth-flow-card.tsx',
    );

    expect(authFlowSource).toContain('AuthFormField');
    expect(authFlowSource).toContain('AuthOtpField');
    expect(authFlowSource).toContain('AuthPrimaryButton');
    expect(authFlowSource).toContain('AuthLinkButton');
    expect(authFlowSource).not.toMatch(/<input\\s/);
    expect(authFlowSource).not.toMatch(/<button\\s/);
  });

  it('should keep auth error feedback atomic and centralized', () => {
    const authFlowSource = readFile('src/components/organisms/auth/auth-flow-card.tsx');
    const inlineMessageSource = readFile(
      'src/components/molecules/auth-inline-message.tsx',
    );
    const feedbackContextSource = readFile('src/context/feedback.tsx');

    expect(authFlowSource).toContain('AuthInlineMessage');
    expect(inlineMessageSource).toContain('text-center');
    expect(inlineMessageSource).toContain('levelClasses');
    expect(feedbackContextSource).not.toMatch(/<div\\s|<section\\s|<aside\\s/);
  });

  it('should keep auth accessibility semantics centralized in form molecules', () => {
    const authFormFieldSource = readFile('src/components/molecules/auth-form-field.tsx');
    const authOtpFieldSource = readFile('src/components/molecules/auth-otp-field.tsx');
    const authInlineMessageSource = readFile(
      'src/components/molecules/auth-inline-message.tsx',
    );

    expect(authFormFieldSource).toContain('aria-invalid');
    expect(authFormFieldSource).toContain('aria-describedby');
    expect(authOtpFieldSource).toContain("role=\"group\"");
    expect(authOtpFieldSource).toContain('aria-labelledby');
    expect(authInlineMessageSource).toContain('aria-live');
  });

  it('should keep protected shell composed by dedicated organisms and centralized logout action', () => {
    const protectedTemplateSource = readFile(
      'src/components/templates/protected-routes-template.tsx',
    );
    const protectedTopbarSource = readFile(
      'src/components/organisms/protected/protected-topbar.tsx',
    );
    const protectedSidebarSource = readFile(
      'src/components/organisms/protected/protected-sidebar.tsx',
    );
    const protectedUserMenuSource = readFile(
      'src/components/molecules/protected-user-menu.tsx',
    );

    expect(protectedTemplateSource).toContain('ProtectedSidebar');
    expect(protectedTemplateSource).toContain('ProtectedTopbar');
    expect(protectedTemplateSource).toContain('ProtectedFooter');
    expect(protectedTopbarSource).toContain('ProtectedUserMenu');
    expect(protectedTopbarSource).toContain('useUserDisplay');
    expect(protectedSidebarSource).toContain('useProtectedNavigation');
    expect(protectedUserMenuSource).toContain('LogoutLink');
    expect(protectedUserMenuSource).not.toContain('useRouter');
  });

  it('should keep logout flow centralized in a dedicated custom hook', () => {
    const useLogoutSource = readFile('src/hooks/useLogout.ts');
    const logoutLinkSource = readFile('src/components/shared/logout-link.tsx');

    expect(useLogoutSource).toContain('useAuth');
    expect(useLogoutSource).toContain('useRouter');
    expect(useLogoutSource).toContain('APP_ROUTES.login');
    expect(useLogoutSource).toContain('router.replace(APP_ROUTES.login)');

    expect(logoutLinkSource).toContain('useLogout');
    expect(logoutLinkSource).not.toContain('useRouter');
    expect(logoutLinkSource).not.toContain('useAuth');
  });

  it('should keep wrapper hooks as aliases to context hooks (DRY)', () => {
    const hookPairs = [
      ['src/hooks/useAuth.ts', 'useAuth = useAuthContext'],
      ['src/hooks/useLoader.ts', 'useLoader = useLoaderContext'],
      ['src/hooks/useFeedback.ts', 'useFeedback = useFeedbackContext'],
    ];

    hookPairs.forEach(([file, expectedSnippet]) => {
      const source = readFile(file);
      expect(source).toContain(expectedSnippet);
    });
  });

  it('should keep jwt parsing centralized in auth-token util and consumed by dedicated auth hook/context', () => {
    const authTokenSource = readFile('src/utils/auth-token.ts');
    const authContextSource = readFile('src/context/auth.tsx');
    const authTokenHookSource = readFile('src/hooks/useAuthTokenSession.ts');
    const middlewareSource = readFile('src/middleware.ts');

    expect(authTokenSource).toContain('getAuthSessionFromToken');
    expect(authContextSource).toContain('useAuthTokenSession');
    expect(authTokenHookSource).toContain('getAuthSessionFromToken');
    expect(middlewareSource).toContain('getAuthSessionFromToken');
  });

  it('should keep middleware matcher aligned with protected app routing contract', () => {
    const middlewareSource = readFile('src/middleware.ts');
    expect(middlewareSource.includes("matcher: ['/', '/login', '/app/:path*']")).toBe(true);
    expect(middlewareSource.includes("if (pathname === '/')")).toBe(true);
    expect(middlewareSource.includes('APP_ROUTES.app')).toBe(true);
    expect(middlewareSource.includes('APP_ROUTES.login')).toBe(true);
    expect(middlewareSource.includes('getAuthSessionFromToken')).toBe(true);
    expect(middlewareSource.includes('isUsersPath')).toBe(true);
  });
});

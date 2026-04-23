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

  it('should keep route path literals centralized through APP_ROUTES in app pages', () => {
    const appPageFiles = sourceFiles.filter((file) => {
      return file.startsWith('src/app/') && file.endsWith('/page.tsx');
    });

    appPageFiles.forEach((file) => {
      const source = readFile(file);

      expect(source).not.toMatch(/path:\s*['"]\/(?:app|login)/);
      expect(source).toContain('APP_ROUTES');
    });
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

  it('should keep middleware matcher aligned with protected app routing contract', () => {
    const middlewareSource = readFile('src/middleware.ts');
    expect(middlewareSource.includes("matcher: ['/', '/login', '/app/:path*']")).toBe(true);
    expect(middlewareSource.includes("if (pathname === '/')")).toBe(true);
    expect(middlewareSource.includes('APP_ROUTES.app')).toBe(true);
    expect(middlewareSource.includes('APP_ROUTES.login')).toBe(true);
  });
});

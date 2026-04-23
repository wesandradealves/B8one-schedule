import { useAuth } from '@/hooks/useAuth';
import { useLoader } from '@/hooks/useLoader';
import { useFeedback } from '@/hooks/useFeedback';
import { useAuthContext } from '@/context/auth';
import { useLoaderContext } from '@/context/loader';
import { useFeedbackContext } from '@/context/feedback';

jest.mock('@/context/auth', () => ({
  useAuthContext: jest.fn(),
}));

jest.mock('@/context/loader', () => ({
  useLoaderContext: jest.fn(),
}));

jest.mock('@/context/feedback', () => ({
  useFeedbackContext: jest.fn(),
}));

describe('wrapper hooks', () => {
  it('should delegate useAuth to AuthContext hook', () => {
    (useAuthContext as jest.Mock).mockReturnValue({ token: 't' });
    expect(useAuth()).toEqual({ token: 't' });
  });

  it('should delegate useLoader to LoaderContext hook', () => {
    (useLoaderContext as jest.Mock).mockReturnValue({ isLoading: true });
    expect(useLoader()).toEqual({ isLoading: true });
  });

  it('should delegate useFeedback to FeedbackContext hook', () => {
    (useFeedbackContext as jest.Mock).mockReturnValue({ messages: [] });
    expect(useFeedback()).toEqual({ messages: [] });
  });
});

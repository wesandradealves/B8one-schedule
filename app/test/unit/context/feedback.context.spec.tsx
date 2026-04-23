import { act, renderHook } from '@testing-library/react';
import { FeedbackProvider, useFeedbackContext } from '@/context/feedback';

describe('FeedbackContext', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => {
    return <FeedbackProvider>{children}</FeedbackProvider>;
  };

  it('should publish, dismiss and clear messages', () => {
    const { result } = renderHook(() => useFeedbackContext(), { wrapper });

    let createdId = '';
    act(() => {
      createdId = result.current.publish('success', 'created');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject({
      id: createdId,
      level: 'success',
      message: 'created',
    });

    act(() => {
      result.current.dismiss(createdId);
    });
    expect(result.current.messages).toHaveLength(0);

    act(() => {
      result.current.publish('error', 'first');
      result.current.publish('warning', 'second');
    });
    expect(result.current.messages).toHaveLength(2);

    act(() => {
      result.current.clear();
    });
    expect(result.current.messages).toHaveLength(0);
  });
});

import { BullMqProvider } from '@/infrastructure/providers/messaging/bullmq/bullmq.provider';
import { Queue } from 'bullmq';

describe('BullMqProvider', () => {
  function createSut() {
    const queue = {
      add: jest.fn(),
    } as unknown as jest.Mocked<Queue>;

    const provider = new BullMqProvider(queue);

    return { provider, queue };
  }

  it('enqueues message on publish', async () => {
    const { provider, queue } = createSut();

    await expect(
      provider.publish('users.created', { userId: 'user-1' }),
    ).resolves.toBeUndefined();

    expect(queue.add).toHaveBeenCalledWith('users.created', { userId: 'user-1' });
  });

  it('does not throw when queue fails', async () => {
    const { provider, queue } = createSut();
    queue.add.mockRejectedValue(new Error('queue down'));

    await expect(
      provider.publish('users.created', { userId: 'user-1' }),
    ).resolves.toBeUndefined();
  });
});

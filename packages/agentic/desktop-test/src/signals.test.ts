import { handleDesktopInterrupts } from './signals.js';

describe('desktop interrupt handling', () => {
  test('escalates repeated interrupts and stays installed until released', () => {
    const before = ['SIGINT', 'SIGTERM', 'SIGHUP'].map((signal) => process.listenerCount(signal));
    const stop = jest.fn();
    const terminate = jest.fn();
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const release = handleDesktopInterrupts({ stop, terminate });
    try {
      process.emit('SIGHUP', 'SIGHUP');
      expect(stop).toHaveBeenCalledWith('SIGHUP');
      process.emit('SIGINT', 'SIGINT');
      expect(terminate).toHaveBeenCalledWith('SIGINT');
      expect(exit).not.toHaveBeenCalled();
      process.emit('SIGTERM', 'SIGTERM');
      expect(exit).toHaveBeenCalledWith(143);
      expect(stop).toHaveBeenCalledTimes(1);
      expect(terminate).toHaveBeenCalledTimes(1);
    } finally {
      release();
      exit.mockRestore();
    }
    expect(['SIGINT', 'SIGTERM', 'SIGHUP'].map((signal) => process.listenerCount(signal))).toEqual(before);
  });
});

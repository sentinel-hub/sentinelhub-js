import { timeoutWrapper, RequestConfiguration } from '../cancelRequests';

class TestClass {
  @timeoutWrapper(1)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async resolvedPromise(timeout: number, reqConfig?: RequestConfiguration): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, timeout);
    });
  }

  @timeoutWrapper(1)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async rejectedPromise(timeout: number, reqConfig?: RequestConfiguration): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        reject('Test error');
      }, timeout);
    });
  }
}

describe('timeoutWrapper', () => {
  const testClass = new TestClass();

  it('should correctly resolve the promise when timeout is undefined', async () => {
    const result = await testClass.resolvedPromise(1);
    expect(result).toBe(true);
  });

  it('should resolve the promise when timeout is null', async () => {
    const result = await testClass.resolvedPromise(1, { timeout: null });
    expect(result).toBe(true);
  });

  it('should resolve the promise when the method finished before the timeout', async () => {
    const result = await testClass.resolvedPromise(1, { timeout: 2 });
    expect(result).toBe(true);
  });

  it('should return an error when the method times out', () => {
    testClass.resolvedPromise(2, { timeout: 1 }).catch(e => {
      expect(e).toEqual({
        error: 'The method did not finish before the specified timeout.',
      });
    });
  });

  it('should correctly reject the promise when timeout is undefined', () => {
    testClass.resolvedPromise(1).catch(e => {
      expect(e).toEqual({
        error: 'Test error',
      });
    });
  });

  it('should correctly reject the promise when timeout is null', () => {
    testClass.resolvedPromise(1, { timeout: null }).catch(e => {
      expect(e).toEqual({
        error: 'Test error',
      });
    });
  });
});

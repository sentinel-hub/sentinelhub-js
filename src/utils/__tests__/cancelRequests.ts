import { timeoutWrapper } from '../cancelRequests';

class TestClass {
  @timeoutWrapper(1)
  public async resolvedPromise(timeout: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(true);
      }, timeout);
    });
  }

  public async errorPromise(): Promise<void> {
    return new Promise((resolve, reject) => {
      reject('Test error');
    });
  }
}

describe('timeoutWrapper', () => {
  const testClass = new TestClass();

  it('should resolve the promise when no timeout is specified', async () => {
    const result = await testClass.resolvedPromise(1);
    expect(result).toBe(true);
  });
});

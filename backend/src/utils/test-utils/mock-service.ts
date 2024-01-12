/* eslint-disable @typescript-eslint/no-explicit-any */
type RecordedCall = {
  name: string;
  method: string | number | symbol;
  arguments: Array<unknown>;
};

type RecordedCalls = Array<RecordedCall>;
type RecordedCallPather = (call: RecordedCall) => RecordedCall;

class MockServiceImpl {
  #savedStatus: Array<{ target: object; state: object }> = [];
  #recordedCalls: RecordedCalls = [];
  #recordedCallPatchers = new Array<RecordedCallPather>();

  public init(objects: Record<string, object>) {
    Object.values(objects).forEach((target) => {
      this.#savedStatus.push({ target, state: { ...target } });
    });
  }

  public restore() {
    this.#savedStatus.forEach((saved) => {
      Object.keys(saved.target).forEach((key) => delete (saved.target as any)[key]);
      Object.assign(saved.target, saved.state);
    });
    this.#savedStatus = [];
    this.#recordedCalls = [];
    this.#recordedCallPatchers = [];
  }

  public installRecordPather(patcher: RecordedCallPather) {
    this.#recordedCallPatchers.push(patcher);
  }

  public get recorded() {
    const patchCalls = (recordedCall: RecordedCall) => {
      let result = recordedCall;
      for (const recordedCallPatcher of this.#recordedCallPatchers) {
        result = recordedCallPatcher(result);
      }
      return result;
    };

    return this.#recordedCalls.map(patchCalls).map((recordedCall) => ({
      [`${recordedCall.name}.${String(recordedCall.method)}`]: recordedCall.arguments,
    }));
  }

  public resetRecordings() {
    this.#recordedCalls = [];
  }

  public record<MOCK_TARGET extends object>(targets: Record<string, MOCK_TARGET>): MOCK_TARGET {
    if (Object.values(targets).length !== 1) {
      throw new Error('Only one object may be mocked per invocation to mock');
    }
    const [name, target] = Object.entries(targets)[0];
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    return new Proxy(target, {
      set(t: any, p, newValue) {
        if (typeof newValue === 'function') {
          t[p] = (...args: any[]) => {
            self.#recordedCalls.push({
              name,
              method: p,
              arguments: args,
            });
            return newValue(...args);
          };
        }
        return true;
      },
    });
  }
}

export const MockService = new MockServiceImpl();

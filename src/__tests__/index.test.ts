// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
// eslint-disable-next-line import/default
import SentryTraceExporter from '../index';

describe('Can create instance of tracer', () => {
  const expectThis = new SentryTraceExporter({});

  it('can instantiate error', () => expect(expectThis).toBeInstanceOf(SentryTraceExporter));
});

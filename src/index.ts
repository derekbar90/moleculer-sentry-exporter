import * as _ from 'lodash';
import * as Sentry from '@sentry/node';
import { TracerExporters, TracerOptions, Span, ServiceBroker, Tracer } from 'moleculer';

class SentryTraceExporter extends TracerExporters.Base {
  broker: ServiceBroker;

  tracer: Tracer;

  constructor(opts: TracerOptions) {
    super(opts);

    this.opts = _.defaultsDeep(this.opts, {
      dsn: process.env.SENRTY_DSN,
      sampleRate: process.env.SENTRY_TRACING_RATE,
    });
  }

  init(tracer: Tracer) {
    this.tracer = tracer;
    this.broker = tracer.broker;
    this.logger = this.opts.logger || this.tracer.logger;

    Sentry.init({
      dsn: this.opts.dsn || null,
      tracesSampleRate: this.opts.sampleRate ? Number(this.opts.sampleRate) : 1,
    });
  }

  // stop() {
  //   // Not implemented
  // }

  // spanStarted(_span: Span) {}

  spanFinished(span: Span) {
    const serviceName = span.service ? span.service.name : 'no-service';

    const transaction = Sentry.startTransaction({
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      op: span.service.fullName,
      name: span.name,
      parentSpanId: this.convertID(span.parentID),
      spanId: this.convertID(span.id),
      traceId: this.convertID(span.traceID),
      tags: {
        serviceName,
        ...this.flattenTags(_.defaultsDeep({}, span.tags)),
      },
    });

    if (span.error) {
      Sentry.captureException(span.error);
    }

    return transaction.finish();
  }

  // eslint-disable-next-line class-methods-use-this
  convertID(id: string): string {
    if (id) {
      return Buffer.from(id.replace(/-/g, ''), 'hex').toString('hex');
    }

    return null;
  }
}

module.exports = SentryTraceExporter;

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = process.hrtime.bigint();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const route = request.route?.path ?? request.url;
    const method = request.method;

    return next.handle().pipe(
      tap(() => {
        const elapsedInNs = process.hrtime.bigint() - startedAt;
        const durationInSeconds = Number(elapsedInNs) / 1_000_000_000;
        const statusCode = response.statusCode;

        this.metricsService.incrementHttpRequests(method, route, statusCode);
        this.metricsService.observeHttpDuration(method, route, statusCode, durationInSeconds);
      }),
    );
  }
}

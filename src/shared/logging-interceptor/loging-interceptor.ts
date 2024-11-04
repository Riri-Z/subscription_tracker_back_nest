import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const originalUrl = context.getArgs()[0]?.originalUrl;
    const method = context.getArgs()[0]?.method;
    const responseStatus = context.getArgs()[1]?.statusCode;

    console.log(
      `\x1b[32m - ${new Date(Date.now()).toLocaleString('fr-FR')}\x1b[0m: called  \x1b[32m...${originalUrl}\x1b[0m  with the following method : \x1b[32m${method}\x1b`,
    );

    return next
      .handle()
      .pipe(
        tap(() =>
          console.log('\x1B[36m%s\x1B[0m', ` - Response : ${responseStatus}`),
        ),
      );
  }
}

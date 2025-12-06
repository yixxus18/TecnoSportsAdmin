import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as exphbs from 'express-handlebars';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { UnauthorizedExceptionFilter } from './auth/unauthorized-exception.filter';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.useStaticAssets(join(__dirname, '..', '..', 'public'));

  // Vistas - sube dos niveles desde dist/src para llegar a la raíz
  app.setBaseViewsDir(join(__dirname, '..', '..', 'views'));

  app.engine(
    'hbs',
    exphbs.engine({
      extname: '.hbs',
      layoutsDir: join(__dirname, '..', '..', 'views', 'layouts'),
      partialsDir: join(__dirname, '..', '..', 'views', 'partials'),
      defaultLayout: 'main',
      helpers: {
        json: (context) => JSON.stringify(context),
        eq: (a: any, b: any) => a === b,
        ne: (a: any, b: any) => a !== b,
        lt: (a: any, b: any) => a < b,
        gt: (a: any, b: any) => a > b,
        lte: (a: any, b: any) => a <= b,
        gte: (a: any, b: any) => a >= b,
        and: (a: any, b: any) => a && b,
        or: (a: any, b: any) => a || b,
      },
    }),
  );

  app.setViewEngine('hbs');
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new UnauthorizedExceptionFilter());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Static Assets: ${join(__dirname, '..', '..', 'public')}`);
  console.log(`Views Directory: ${join(__dirname, '..', '..', 'views')}`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();

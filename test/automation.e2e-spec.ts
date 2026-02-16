import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AutomationController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/automation/delay (POST) delays response', async () => {
    const delayMs = 500;
    const start = Date.now();

    const res = await request(app.getHttpServer())
      .post('/automation/delay')
      .send({ delay: delayMs })
      .expect(200);

    const elapsed = Date.now() - start;
    expect(res.body).toEqual({ delayed: delayMs });
    expect(elapsed).toBeGreaterThanOrEqual(delayMs - 50);
  });
});

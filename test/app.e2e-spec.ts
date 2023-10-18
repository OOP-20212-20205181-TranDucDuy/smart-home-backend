import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { User } from 'src/user/entities/user.entity';
describe('App (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
       const moduleFixture: TestingModule = await Test.createTestingModule({
          imports: [AppModule]
      }).compile();
    
      app = moduleFixture.createNestApplication();
      app.enableCors();
      app.useGlobalPipes(new ValidationPipe());
      await app.init();
  });
  describe('Authentication', () => {
    let jwtToken: string;
    let accessKey : string;
    describe('AuthModule', () => {
      // assume test data includes user test@example.com with password 'password'
      it('authenticates admin with valid credentials and provides a jwt token', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'tduy0215@gmail.com', password: '123' })
          .expect(200)

        // set jwt token for use in subsequent tests
        jwtToken = response.body.accessToken
        expect(jwtToken).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/) // jwt regex
      })

      it('authenticates user with valid credentials and provides a access key', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'tduy0218@gmail.com', password: '123' })
          .expect(200)

        // set jwt token for use in subsequent tests
        accessKey = response.body.accessToken
        expect(accessKey).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/) 
      })

      it('fails to authenticate user with an null email', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: null, password: 'wrong' })
          .expect(400)

        expect(response.body.accessToken).not.toBeDefined()
      })

      
      it('fails to authenticate user with an password email', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'tduy0215@gmail.com', password: null })
          .expect(400)
        expect(response.body.accessToken).not.toBeDefined()
      })

      // send an acccount which has been in database but email has not been verified yet
      it('fails to authenticate user with an email which has not been verified yet', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'tduy0221@gmail.com', password: '123' })
          .expect(400)
        expect(response.body.accessToken).not.toBeDefined()
      })

      it('fails to authenticate user with an incorrect password', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'tduy0215@gmail.com', password: 'wrong' })
          .expect(401)

        expect(response.body.accessToken).not.toBeDefined()
      })

      // assume test data does not include a nobody@example.com user
      it('fails to authenticate user that does not exist', async () => {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send({ email: 'nobody@example.com', password: 'test' })
          .expect(401)

        expect(response.body.accessToken).not.toBeDefined()
      })
    })

    describe('Protected', () => {
      it('gets protected resource with jwt authenticated request', async () => {
        const response = await request(app.getHttpServer())
          .get('/auth/logout')
          .set('Authorization', `Bearer ${jwtToken}`)
          .expect(200)

        const data = response.body.data

      })
    })

    describe('UserModule', ()=> {
      it('gets user by id with jwt admin account' , async () => {
        const response = await request(app.getHttpServer())
        .get('/user/2')
        .set('Authorization', `Bearer ${jwtToken}`)
        .expect(200)

        const data : Promise<User> = response.body.data;
      })
      it('gets user by id with jwt user account' , async () => {
        const response = await request(app.getHttpServer())
        .get('/user/1')
        .set('Authorization', `Bearer ${accessKey}`)
        .expect(403)
        const data : Promise<User> = response.body.data;
      })
      it('update yourself profile with user account' , async () => {
        const response = await request(app.getHttpServer())
        .patch('/user')
        .set('Authorization', `Bearer ${accessKey}`)
        .send({
          name : "Duy",
          birth : "2002-10-12",
          address : "Ha Noi"
        })
        .expect(200)
      })
      it('update other account profile with admin account' , async () => {
        const response = await request(app.getHttpServer())
        .patch('/user/2')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name : "Duy",
          birth : "2002-10-12",
          address : "Ha Noi"
        })
        .expect(200)
      })
      it('update other profile profile with user account', async () => {
        const response = await request(app.getHttpServer())
        .patch('/user/2')
        .set('Authorization', `Bearer ${accessKey}`)
        .send({
          name : "Duy",
          birth : "2002-10-12",
          address : "Ha Noi"
        })
        .expect(403)
      })

      it('update yourself  profile with user account with invalid input syntax for type timestamp', async () => {
        const response = await request(app.getHttpServer())
        .patch('/user')
        .set('Authorization', `Bearer ${accessKey}`)
        .send({
          name : "Duy",
          birth : "12-20-2002",
          address : "Ha Noi"
        })
        .expect(500)
      })
      it('update user profile not in database with admin account ', async () => {
        const response = await request(app.getHttpServer())
        .patch('/user/3')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name : "Duy",
          birth : "12-20-2002",
          address : "Ha Noi"
        })
        .expect(500)
      })
      it('update user profile not verified with admin account ', async () => {
        const response = await request(app.getHttpServer())
        .patch('/user/4')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name : "Duy",
          birth : "12-20-2002",
          address : "Ha Noi"
        })
        .expect(400)
      })
    })
  })
});

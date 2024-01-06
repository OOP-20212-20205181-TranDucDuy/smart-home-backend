import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './entities/notification.entity';
import { Repository } from 'typeorm';
import * as serviceAccount from '../constant/serviceAccount.json'
import admin from 'firebase-admin';
import { Message } from 'firebase-admin/lib/messaging/messaging-api';
;
@Injectable()
export class NotificationService {
    private readonly app: admin.app.App;
    constructor(
        @InjectRepository(Notification) public notificationRepository : Repository<Notification>,
    ) {
        
      this.app = admin.initializeApp({
        credential: admin.credential.cert(
            JSON.parse(JSON.stringify(serviceAccount)),
          ),
        databaseURL: 'https://smarthome-5efe4.firebaseio.com', // Replace with your Firebase project ID
      });
    }
  
    getFirestore() {
      return this.app.firestore();
    }
    async subscribeToTopic(token: string, topic : string) {
        try {
          await this.app.messaging().subscribeToTopic([token], topic);
          return { success: true, message: 'Subscribed to topic successfully'};
        } catch (error) {
          console.error('Error subscribing to topic:', error);
          throw new BadRequestException('Failed to subscribe to topic');
        }
      }
    async unsubscribeToTopic(token: string,topic : string){
        try {
            await this.app.messaging().unsubscribeFromTopic([token], topic);      
            return { success: true, message: 'Unsubscribed to topic successfully' };
          } catch (error) {
            console.error('Error subscribing to topic:', error);
            throw new BadRequestException('Failed to subscribe to topic');
          }
    }
    async sendNotificationToTopic(topic : string, title : string, body : string){
      const message = {
        notification: {
          title,
          body,
        },
      };
      try {
        await this.app.messaging().sendToTopic(topic,message);
      }
      catch(error){
        console.error('Error sending notification to topic:', error);
        throw error;
      }
    }
    async sendMutilNotificationToTopic(messages : Message[]){
      try {
        await this.app.messaging().sendEach(messages);
      }
      catch(error){
        console.error('Error sending notification to topic:', error);
        throw error;
      }
    }
    async sendNotificationToMutilToken(tokens: string[], title: string, body: string) {
      if (!tokens.length) {
          throw new Error('Tokens array is empty.');
      }
  
      const message = {
          notification: {
              title,
              body,
          },
          tokens, // Assuming this is the correct structure for your method
      };
  
      try {
          const response = await this.app.messaging().sendEachForMulticast(message);
          console.log('Notifications sent successfully:', response);
          console.log('Message:', message);
          return {
              response: {
                  message,
              },
          };
      } catch (error) {
          console.error('Error sending notifications:', error);
          throw error;
      }
    }
    async sendMultiMessageToMutilToken(notifications : Notification[],token : string){
      const messages = [];
      notifications.forEach(notification => {
        messages.push({
          notification : {
            title : notification.title,
            body : notification.body
          },
          token : token
        })
      });
      try {
        const response = await this.app.messaging().sendEach(messages)
      } catch (error) {
        return error;
      }
    }
  }

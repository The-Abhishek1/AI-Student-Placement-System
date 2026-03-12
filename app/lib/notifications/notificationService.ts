import connectDB from '@/app/lib/db/mongodb';
import User from '@/app/lib/db/models/User';
// import { sendEmail } from '@/app/lib/email/emailService';

export interface NotificationData {
  type: 'match' | 'job' | 'placement' | 'system';
  title: string;
  message: string;
  data?: any;
  userIds: string[];
  sendEmail?: boolean;
}

export class NotificationService {
  static async sendNotification(data: NotificationData) {
    try {
      await connectDB();

      const notifications = data.userIds.map(userId => ({
        id: new mongoose.Types.ObjectId().toString(),
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.data,
        read: false,
        createdAt: new Date()
      }));

      // Add notifications to users
      await User.updateMany(
        { _id: { $in: data.userIds } },
        { $push: { notifications: { $each: notifications } } }
      );

      // Send emails if required
      if (data.sendEmail) {
        const users = await User.find({ _id: { $in: data.userIds } });
        for (const user of users) {
          await sendEmail({
            to: user.email,
            subject: data.title,
            html: `
              <h2>${data.title}</h2>
              <p>${data.message}</p>
              ${data.data ? `<pre>${JSON.stringify(data.data, null, 2)}</pre>` : ''}
            `
          });
        }
      }

      return { success: true, count: notifications.length };
    } catch (error) {
      console.error('Notification error:', error);
      return { success: false, error };
    }
  }

  static async markAsRead(userId: string, notificationId: string) {
    await connectDB();
    return User.updateOne(
      { _id: userId, 'notifications.id': notificationId },
      { $set: { 'notifications.$.read': true } }
    );
  }

  static async markAllAsRead(userId: string) {
    await connectDB();
    return User.updateOne(
      { _id: userId },
      { $set: { 'notifications.$[].read': true } }
    );
  }

  static async getUnreadCount(userId: string) {
    await connectDB();
    const user = await User.findById(userId);
    return user?.notifications?.filter((n: any) => !n.read).length || 0;
  }
}
import { NewsDAO } from '@src/database/dao/notification/news-dao.js';
import type { DBNotification } from '@src/database/dao/notification/notification-dao.js';
import { NotificationDAO } from '@src/database/dao/notification/notification-dao.js';
import { UserDAO, type DBUser } from '@src/database/dao/user/user/user-dao.js';
import type { NewsNotification, NewsNotificationRequest, UserNotification } from 'sleepapi-common';
import { NotificationType, uuid, type BaseUser, type NotificationResponse } from 'sleepapi-common';

class NotificationServiceImpl {
  public async getNotifications(user: DBUser): Promise<NotificationResponse> {
    const notificationsDto = await NotificationDAO.findMultiple({ fk_receiver_id: user.id });

    const notifications: UserNotification[] = [];
    for (const notification of notificationsDto) {
      const senderRaw = await UserDAO.get({ id: notification.fk_sender_id });
      const receiverRaw = await UserDAO.get({ id: notification.fk_receiver_id });

      const sender: BaseUser = { friend_code: senderRaw.friend_code, name: senderRaw.name, avatar: senderRaw.avatar };
      const receiver: BaseUser = {
        friend_code: receiverRaw.friend_code,
        name: receiverRaw.name,
        avatar: receiverRaw.avatar
      };
      const externalId = notification.external_id;

      const template = notification.template;
      if (template === NotificationType.News) {
        const news = await this.getNewsNotification(notification);
        notifications.push({ sender, receiver, template, news, externalId });
      } else notifications.push({ sender, receiver, template, externalId });
    }
    return { notifications: notifications };
  }

  public async dismissNotification(externalId: string) {
    await NotificationDAO.delete({ external_id: externalId });
    return;
  }

  public async getNewsNotifications(): Promise<NewsNotification[]> {
    const notifications = await NewsDAO.findMultiple();

    const newsNotifications: NewsNotification[] = [];
    for (const notification of notifications) {
      const author = await UserDAO.get({ id: notification.fk_author_id });

      newsNotifications.push({
        author: author.name,
        authorAvatar: author.avatar ?? 'default',
        title: notification.title,
        content: notification.content,
        created_at: notification.created_at?.toString()
      });
    }
    return newsNotifications;
  }

  public async addNewsNotification(params: { admin: DBUser; newsRequest: NewsNotificationRequest }): Promise<void> {
    const { admin, newsRequest } = params;

    const news = await NewsDAO.insert({
      fk_author_id: admin.id,
      title: newsRequest.title,
      content: newsRequest.content
    });

    const receivers = await UserDAO.findMultiple();
    for (const receiver of receivers) {
      await NotificationDAO.insert({
        fk_sender_id: admin.id,
        fk_receiver_id: receiver.id,
        template: NotificationType.News,
        vfk_content_id: news.id,
        external_id: uuid.v4()
      });
    }

    return;
  }

  private async getNewsNotification(notification: DBNotification): Promise<NewsNotification> {
    if (!notification.vfk_content_id) {
      throw new Error('Missing vfk_content_id is required for News notification');
    }
    const news = await NewsDAO.get({ id: notification.vfk_content_id });
    const author = await UserDAO.get({ id: news.fk_author_id });

    return {
      author: author.name,
      authorAvatar: author.avatar ?? 'default',
      title: news.title,
      content: news.content,
      created_at: news.created_at?.toString()
    };
  }
}

export const NotificationService = new NotificationServiceImpl();

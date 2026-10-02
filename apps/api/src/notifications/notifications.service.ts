import { Injectable } from "@nestjs/common";
import { NotificationChannel } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { PaginationDto, toSkipTake } from "../common/dto/pagination.dto";

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async notify(params: {
    userId: string;
    type: string;
    title: string;
    message: string;
    channel?: NotificationChannel;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        channel: params.channel ?? NotificationChannel.IN_APP,
      },
    });
  }

  async findForUser(userId: string, pagination: PaginationDto) {
    const { skip, take } = toSkipTake(pagination);
    const [data, total, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.count({ where: { userId, read: false } }),
    ]);
    return { data, total, unreadCount, page: pagination.page, limit: pagination.limit };
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}

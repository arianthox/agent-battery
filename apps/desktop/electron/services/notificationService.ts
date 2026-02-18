import { Notification } from "electron";
import { prisma } from "@agent-battery/db";

export class NotificationService {
  async notifyLowBattery(accountId: string, title: string, body: string): Promise<void> {
    const key = "low_battery";
    const now = new Date();
    const existing = await prisma.notificationState.findUnique({
      where: { accountId_notificationKey: { accountId, notificationKey: key } }
    });
    if (existing && now.getTime() - existing.lastSentAt.getTime() < 15 * 60 * 1000) {
      return;
    }
    new Notification({ title, body }).show();
    await prisma.notificationState.upsert({
      where: { accountId_notificationKey: { accountId, notificationKey: key } },
      create: { accountId, notificationKey: key, lastSentAt: now },
      update: { lastSentAt: now }
    });
  }

  async notifyPersistentFailure(accountId: string, title: string, body: string): Promise<void> {
    const key = "persistent_sync_failure";
    const now = new Date();
    const existing = await prisma.notificationState.findUnique({
      where: { accountId_notificationKey: { accountId, notificationKey: key } }
    });
    if (existing && now.getTime() - existing.lastSentAt.getTime() < 30 * 60 * 1000) {
      return;
    }
    new Notification({ title, body }).show();
    await prisma.notificationState.upsert({
      where: { accountId_notificationKey: { accountId, notificationKey: key } },
      create: { accountId, notificationKey: key, lastSentAt: now },
      update: { lastSentAt: now }
    });
  }
}

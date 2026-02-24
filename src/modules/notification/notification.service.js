import prisma from "../../prisma/client.js";

const parseBooleanParam = (value) => {
  if (value === undefined || value === null) {
    return false;
  }
  const normalized = String(value).trim().toLowerCase();
  return normalized === "true" || normalized === "1";
};

const parseIdParam = (value, name) => {
  if (value === undefined || value === null || value === "") {
    throw Object.assign(new Error(`${name} is required`), { status: 400 });
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw Object.assign(new Error(`${name} must be a valid number`), { status: 400 });
  }
  return parsed;
};

export const listNotificationsForUser = async ({ userId, unreadOnly }) => {
  if (!userId) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }

  const where = {
    userId,
    ...(unreadOnly ? { read: false } : {}),
  };

  return prisma.notification.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const markNotificationRead = async ({ userId, notificationId }) => {
  const id = parseIdParam(notificationId, "notification id");

  const notification = await prisma.notification.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!notification) {
    throw Object.assign(new Error("Notification not found"), { status: 404 });
  }

  return prisma.notification.update({
    where: { id },
    data: {
      read: true,
    },
  });
};

export const markAllNotificationsReadForUser = async ({ userId }) => {
  if (!userId) {
    throw Object.assign(new Error("Unauthorized"), { status: 401 });
  }

  const result = await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });

  return result.count;
};

export const parseUnreadOnlyFlag = parseBooleanParam;

import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { EnergyLevel, EvidenceCategory } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service.js";
import { CreateTaskDto } from "./dto/create-task.dto.js";
import { UpdateTaskDto } from "./dto/update-task.dto.js";

const STARTER_TASKS = [
  {
    title: "写下今天最想完成的一件小事",
    area: "自我整理",
    energyLevel: EnergyLevel.LOW,
    dueLabel: "今天",
  },
  {
    title: "完成 15 分钟专注学习或练习",
    area: "学习成长",
    energyLevel: EnergyLevel.MEDIUM,
    dueLabel: "今天",
  },
  {
    title: "睡前记录一个行动证据",
    area: "成长档案",
    energyLevel: EnergyLevel.LOW,
    dueLabel: "今晚",
  },
] as const;

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

function toTaskDto(task: {
  id: string;
  title: string;
  area: string;
  energyLevel: EnergyLevel;
  isCompleted: boolean;
  scheduledDate: Date | null;
  dueLabel: string | null;
  completedAt: Date | null;
  sortOrder: number;
}) {
  return {
    id: task.id,
    title: task.title,
    area: task.area,
    energyLevel: task.energyLevel.toLowerCase(),
    isCompleted: task.isCompleted,
    scheduledDate: task.scheduledDate?.toISOString().slice(0, 10) ?? null,
    dueLabel: task.dueLabel,
    completedAt: task.completedAt?.toISOString() ?? null,
    sortOrder: task.sortOrder,
  };
}

function mapEnergyLevel(energyLevel?: "low" | "medium" | "high") {
  const energyMap = {
    low: EnergyLevel.LOW,
    medium: EnergyLevel.MEDIUM,
    high: EnergyLevel.HIGH,
  } as const;

  return energyLevel ? energyMap[energyLevel] : undefined;
}

@Injectable()
export class TasksService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async ensureTodayTasks(userId: string) {
    const scheduledDate = todayDateOnly();
    const existingCount = await this.prisma.dailyTask.count({
      where: { userId, scheduledDate },
    });

    if (existingCount > 0) {
      return;
    }

    await this.prisma.dailyTask.createMany({
      data: STARTER_TASKS.map((task, index) => ({
        userId,
        title: task.title,
        area: task.area,
        energyLevel: task.energyLevel,
        dueLabel: task.dueLabel,
        scheduledDate,
        sortOrder: index + 1,
      })),
    });
  }

  async getTodayTasks(userId: string) {
    await this.ensureTodayTasks(userId);
    const scheduledDate = todayDateOnly();
    const tasks = await this.prisma.dailyTask.findMany({
      where: { userId, scheduledDate },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return tasks.map(toTaskDto);
  }

  async createTask(userId: string, dto: CreateTaskDto) {
    const title = dto.title.trim();
    if (!title) {
      throw new NotFoundException("任务标题不能为空");
    }

    const scheduledDate = todayDateOnly();
    const lastTask = await this.prisma.dailyTask.findFirst({
      where: { userId, scheduledDate },
      orderBy: { sortOrder: "desc" },
    });

    const task = await this.prisma.dailyTask.create({
      data: {
        userId,
        title,
        area: dto.area?.trim() || "自我整理",
        energyLevel: mapEnergyLevel(dto.energyLevel) ?? EnergyLevel.LOW,
        dueLabel: dto.dueLabel?.trim() || "今天",
        scheduledDate,
        sortOrder: (lastTask?.sortOrder ?? 0) + 1,
      },
    });

    return {
      task: toTaskDto(task),
      catEvent: {
        persona: "zhixing",
        message: "新任务已放进今日清单，我们按最小一步开始。",
      },
    };
  }

  async updateTask(userId: string, taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.dailyTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException("任务不存在");
    }

    const data: {
      title?: string;
      area?: string;
      energyLevel?: EnergyLevel;
      dueLabel?: string;
      isCompleted?: boolean;
      completedAt?: Date | null;
    } = {};

    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.area !== undefined) data.area = dto.area.trim();
    if (dto.energyLevel !== undefined)
      data.energyLevel = mapEnergyLevel(dto.energyLevel);
    if (dto.dueLabel !== undefined) data.dueLabel = dto.dueLabel.trim();
    if (dto.isCompleted !== undefined) {
      data.isCompleted = dto.isCompleted;
      data.completedAt = dto.isCompleted
        ? (task.completedAt ?? new Date())
        : null;
    }

    const updatedTask = await this.prisma.dailyTask.update({
      where: { id: task.id },
      data,
    });

    return {
      task: toTaskDto(updatedTask),
      catEvent: {
        persona: "zhixing",
        message: "任务内容已更新，今天的行动清单更贴近你了。",
      },
    };
  }

  async completeTask(userId: string, taskId: string) {
    const task = await this.prisma.dailyTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException("任务不存在");
    }

    if (task.isCompleted) {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
      });
      return {
        task: toTaskDto(task),
        user,
        evidenceRecord: null,
        catEvent: {
          persona: "encourage",
          message: "这件事已经记入行动证据啦。",
        },
      };
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const completedTask = await tx.dailyTask.update({
        where: { id: task.id },
        data: {
          isCompleted: true,
          completedAt: new Date(),
        },
      });

      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          xp: { increment: 10 },
          fishCoin: { increment: 3 },
          intimacy: { increment: 1 },
        },
      });

      const evidenceRecord = await tx.evidenceRecord.create({
        data: {
          userId,
          title: `完成任务：${completedTask.title}`,
          category: EvidenceCategory.ACTION_COMPLETED,
          note: "今日任务已完成，行动证据已自动记录。",
          sourceType: "task",
          sourceId: completedTask.id,
          fishEarned: 3,
        },
      });

      return { completedTask, updatedUser, evidenceRecord };
    });

    return {
      task: toTaskDto(result.completedTask),
      user: result.updatedUser,
      evidenceRecord: result.evidenceRecord,
      catEvent: {
        persona: "encourage",
        message: "收到一个行动反馈，小鱼干已经入账。",
      },
    };
  }

  async reopenTask(userId: string, taskId: string) {
    const task = await this.prisma.dailyTask.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      throw new NotFoundException("任务不存在");
    }

    const reopenedTask = await this.prisma.dailyTask.update({
      where: { id: task.id },
      data: {
        isCompleted: false,
        completedAt: null,
      },
    });
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return {
      task: toTaskDto(reopenedTask),
      user,
      evidenceRecord: null,
      catEvent: {
        persona: "zhixing",
        message: "任务已放回今日清单，奖励记录保持不变。",
      },
    };
  }
}

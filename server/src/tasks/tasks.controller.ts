import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Patch,
  Post,
} from "@nestjs/common";

import { readGuestUserId } from "../auth/guest-token.js";
import { ok } from "../common/api-response.js";
import { CreateTaskDto } from "./dto/create-task.dto.js";
import { UpdateTaskDto } from "./dto/update-task.dto.js";
import { TasksService } from "./tasks.service.js";

@Controller("tasks")
export class TasksController {
  constructor(
    @Inject(TasksService) private readonly tasksService: TasksService,
  ) {}

  @Get("today")
  async today(
    @Headers("authorization") authorization?: string,
    @Headers("x-user-id") userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader);
    const tasks = await this.tasksService.getTodayTasks(userId);
    return ok(tasks);
  }

  @Post()
  async create(
    @Body() dto: CreateTaskDto,
    @Headers("authorization") authorization?: string,
    @Headers("x-user-id") userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader);
    const result = await this.tasksService.createTask(userId, dto);
    return ok(result, "task_created");
  }

  @Patch(":id")
  async update(
    @Param("id") taskId: string,
    @Body() dto: UpdateTaskDto,
    @Headers("authorization") authorization?: string,
    @Headers("x-user-id") userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader);
    const result = await this.tasksService.updateTask(userId, taskId, dto);
    return ok(result, "task_updated");
  }

  @Post(":id/complete")
  async complete(
    @Param("id") taskId: string,
    @Headers("authorization") authorization?: string,
    @Headers("x-user-id") userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader);
    const result = await this.tasksService.completeTask(userId, taskId);
    return ok(result);
  }

  @Post(":id/reopen")
  async reopen(
    @Param("id") taskId: string,
    @Headers("authorization") authorization?: string,
    @Headers("x-user-id") userIdHeader?: string,
  ) {
    const userId = readGuestUserId(authorization, userIdHeader);
    const result = await this.tasksService.reopenTask(userId, taskId);
    return ok(result, "task_reopened");
  }
}

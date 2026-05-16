import type { EnergyLevel, Task } from "../types/app";

export function getCompletionRate(tasks: Task[]) {
  if (tasks.length === 0) return 0;
  return Math.round(
    (tasks.filter((task) => task.done).length / tasks.length) * 100,
  );
}

export function getNextTask(tasks: Task[]) {
  const undoneTasks = tasks.filter((task) => !task.done);
  if (undoneTasks.length === 0) {
    return {
      id: "all-done",
      title: "今日核心任务全部完成，高能量挑战已解锁",
      area: "特别任务",
      energy: "高能量" as const,
      done: true,
      dueLabel: "已完成",
    };
  }

  const completionRate = getCompletionRate(tasks);
  const preferredEnergy: EnergyLevel =
    completionRate >= 100
      ? "高能量"
      : completionRate >= 50
        ? "中能量"
        : "低能量";

  return (
    undoneTasks.find((task) => task.energy === preferredEnergy) ??
    undoneTasks[0]
  );
}

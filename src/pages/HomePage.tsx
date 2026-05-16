import { useState } from "react";
import type { FormEvent } from "react";
import { moodOptions, moodSupportActions } from "../data/mockData";
import type {
  EnergyLevel,
  MissionProgress,
  MoodRecord,
  MoodResponse,
  MoodSupportAction,
  SpecialMission,
  Task,
  UserProfile,
} from "../types/app";
import { ModuleIcon } from "../components/ModuleIcon";

type HomePageProps = {
  tasks: Task[];
  moods: MoodRecord[];
  user: UserProfile;
  completionRate: number;
  completedCount: number;
  nextTask: Task;
  missions: MissionProgress[];
  moodResponse: MoodResponse;
  selectedMood: string;
  onToggleTask: (id: Task["id"]) => void;
  onCreateTask: (payload: {
    title: string;
    area: string;
    energy: EnergyLevel;
    dueLabel: string;
  }) => void;
  onMood: (mood: string) => void;
  onClaimMission: (missionId: SpecialMission["id"]) => void;
  onMoodSupportAction: (actionId: MoodSupportAction["id"]) => void;
};

export function HomePage({
  tasks,
  moods,
  user,
  completionRate,
  completedCount,
  nextTask,
  missions,
  moodResponse,
  selectedMood,
  onToggleTask,
  onCreateTask,
  onMood,
  onClaimMission,
  onMoodSupportAction,
}: HomePageProps) {
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskArea, setTaskArea] = useState("自我整理");
  const [taskEnergy, setTaskEnergy] = useState<EnergyLevel>("低能量");
  const [taskDueLabel, setTaskDueLabel] = useState("今天");
  const highlightMission = missions[0];
  const dailyMissions = missions.slice(1);
  const energyHint =
    moodResponse.recommendedEnergy === "低能量"
      ? `当前状态推荐${moodResponse.recommendedEnergy}`
      : completionRate >= 100
      ? "完成率 100%，解锁高能量"
      : completionRate >= 50
        ? `完成率 50%+，可试试${moodResponse.recommendedEnergy}`
        : `先从${moodResponse.recommendedEnergy}启动`;
  const recentMoods = moods.slice(0, 3);
  const visibleTasks = showAllTasks ? tasks : tasks.slice(0, 5);
  const hiddenTaskCount = Math.max(tasks.length - visibleTasks.length, 0);
  const recommendedSupportActions = moodResponse.supportActionIds
    .map((actionId) => moodSupportActions.find((action) => action.id === actionId))
    .filter((action): action is MoodSupportAction => Boolean(action));
  const visibleSupportActions = recommendedSupportActions.length > 0
    ? recommendedSupportActions
    : moodSupportActions.slice(0, 2);

  function submitTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;

    onCreateTask({
      title,
      area: taskArea.trim() || "自我整理",
      energy: taskEnergy,
      dueLabel: taskDueLabel.trim() || "今天",
    });
    setTaskTitle("");
    setTaskDueLabel("今天");
    setShowAllTasks(true);
  }

  return (
    <div className="page-stack">
      <section className="dashboard-band">
        <div>
          <span className="module-badge mango">
            <ModuleIcon name="progress" />
          </span>
          <p className="eyebrow">今日完成率</p>
          <strong>{completionRate}%</strong>
          <span>
            {completedCount} / {tasks.length} 项已完成
          </span>
        </div>
        <div>
          <span className="module-badge mint">
            <ModuleIcon name="next" />
          </span>
          <p className="eyebrow">下一步</p>
          <strong>{nextTask.energy}</strong>
          <span>{nextTask.title}</span>
          <small className="energy-hint">{energyHint}</small>
        </div>
        <div>
          <span className="module-badge sky">
            <ModuleIcon name="fish" />
          </span>
          <p className="eyebrow">小鱼干资产</p>
          <strong>{user.fishCount}</strong>
          <span>连续打卡 {user.streakDays} 天</span>
        </div>
      </section>

      {highlightMission && (
        <section className="special-mission-panel">
          <div className="special-mission-hero">
            <span className={`module-badge ${highlightMission.tone}`}>
              <ModuleIcon name="trophy" />
            </span>
            <div>
              <div className="mission-kicker">
                <span>特别任务</span>
                <span>{highlightMission.expiresIn}</span>
              </div>
              <h2>{highlightMission.title}</h2>
              <p>{highlightMission.description}</p>
            </div>
          </div>
          <div className="mission-progress-row">
            <strong>
              完成 {highlightMission.target} {highlightMission.unit}
            </strong>
            <span>
              {highlightMission.current} / {highlightMission.target}
            </span>
          </div>
          <div
            className="mission-bar"
            aria-label={`${highlightMission.title}进度 ${highlightMission.percent}%`}
          >
            <span style={{ width: `${highlightMission.percent}%` }}></span>
          </div>
          <button
            type="button"
            className={
              highlightMission.claimed
                ? "reward-action claimed"
                : "reward-action"
            }
            disabled={!highlightMission.completed || highlightMission.claimed}
            onClick={() => onClaimMission(highlightMission.id)}
          >
            <ModuleIcon
              name={highlightMission.claimed ? "check" : "fish"}
              size={17}
            />
            <span>
              {highlightMission.claimed
                ? "已领取"
                : highlightMission.completed
                  ? `领取 ${highlightMission.rewardLabel}`
                  : "完成后领取"}
            </span>
          </button>
          <div className="daily-mission-grid">
            {dailyMissions.map((mission) => (
              <article
                key={mission.id}
                className={
                  mission.claimed
                    ? "mission-card claimed"
                    : mission.completed
                      ? "mission-card done"
                      : "mission-card"
                }
              >
                <span className={`module-badge ${mission.tone}`}>
                  <ModuleIcon
                    name={
                      mission.claimed
                        ? "check"
                        : mission.completed
                          ? "fish"
                          : "fish"
                    }
                    size={20}
                  />
                </span>
                <div>
                  <div className="mission-kicker">
                    <span>{mission.expiresIn}</span>
                    <span>{mission.rewardLabel}</span>
                  </div>
                  <h3>{mission.title}</h3>
                  <p>{mission.description}</p>
                  <div
                    className="mission-bar small"
                    aria-label={`${mission.title}进度 ${mission.percent}%`}
                  >
                    <span style={{ width: `${mission.percent}%` }}></span>
                  </div>
                  <small>
                    {mission.current} / {mission.target} {mission.unit}
                  </small>
                  <button
                    type="button"
                    className={
                      mission.claimed
                        ? "reward-action compact claimed"
                        : "reward-action compact"
                    }
                    disabled={!mission.completed || mission.claimed}
                    onClick={() => onClaimMission(mission.id)}
                  >
                    <ModuleIcon
                      name={mission.claimed ? "check" : "fish"}
                      size={15}
                    />
                    <span>
                      {mission.claimed
                        ? "已领取"
                        : mission.completed
                          ? "领取奖励"
                          : "待完成"}
                    </span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <div className="home-action-grid">
        <section className="section-block">
          <div className="section-heading">
            <h2>
              <span className="heading-icon">
                <ModuleIcon name="tasks" size={18} />
              </span>
              今日核心任务
            </h2>
            <span>先完成一个就好</span>
          </div>
          <form className="task-create-form" onSubmit={submitTask}>
            <input
              value={taskTitle}
              onChange={(event) => setTaskTitle(event.target.value)}
              placeholder="新增一个今天能做的小任务"
              maxLength={120}
            />
            <select
              value={taskArea}
              onChange={(event) => setTaskArea(event.target.value)}
              aria-label="任务领域"
            >
              <option value="自我整理">自我整理</option>
              <option value="学习成长">学习成长</option>
              <option value="实践体验">实践体验</option>
              <option value="社会情感">社会情感</option>
              <option value="成长档案">成长档案</option>
            </select>
            <select
              value={taskEnergy}
              onChange={(event) =>
                setTaskEnergy(event.target.value as EnergyLevel)
              }
              aria-label="任务能量"
            >
              <option value="低能量">低能量</option>
              <option value="中能量">中能量</option>
              <option value="高能量">高能量</option>
            </select>
            <input
              value={taskDueLabel}
              onChange={(event) => setTaskDueLabel(event.target.value)}
              placeholder="今天"
              maxLength={20}
            />
            <button type="submit">
              <ModuleIcon name="tasks" size={16} />
              <span>加入</span>
            </button>
          </form>
          <div
            className={
              showAllTasks ? "task-list task-list-expanded" : "task-list"
            }
          >
            {visibleTasks.map((task) => (
              <button
                type="button"
                className={task.done ? "task-card done" : "task-card"}
                key={task.id}
                onClick={() => onToggleTask(task.id)}
              >
                <span className="task-check">
                  <ModuleIcon name={task.done ? "check" : "empty"} size={16} />
                </span>
                <span>
                  <strong>{task.title}</strong>
                  <small>
                    {task.area} · {task.energy} · {task.dueLabel}
                  </small>
                </span>
              </button>
            ))}
            {tasks.length > 5 && (
              <button
                type="button"
                className="task-expand-action"
                onClick={() => setShowAllTasks((current) => !current)}
              >
                <ModuleIcon name="arrow" size={16} />
                <span>
                  {showAllTasks
                    ? "收起任务"
                    : `下滑显示全部 ${tasks.length} 项`}
                </span>
              </button>
            )}
            {hiddenTaskCount > 0 && (
              <div className="task-overflow-note">
                还有 {hiddenTaskCount} 项已收进任务池，展开时可以慢慢看。
              </div>
            )}
          </div>
        </section>

        <section className="section-block mood-hub">
          <div className="section-heading">
            <h2>
              <span className="heading-icon">
                <ModuleIcon name="mood" size={18} />
              </span>
              情绪小站
            </h2>
            <span>当前：{selectedMood}</span>
          </div>
          <div className="mood-grid compact-mood-grid">
            {moodOptions.map((mood) => (
              <button
                type="button"
                className={selectedMood === mood ? "selected" : ""}
                key={mood}
                onClick={() => onMood(mood)}
              >
                <ModuleIcon name="mood" size={16} />
                <span>{mood}</span>
              </button>
            ))}
          </div>
          <div className={`mood-response-card mood-${moodResponse.manorTheme}`}>
            <strong>{moodResponse.companionLine}</strong>
            <span>{moodResponse.manorHint}</span>
          </div>
          <div className="support-strip-heading">
            <strong>现在优先做这两步</strong>
            <span>不用一次解决全部，先让身体和行动回到可控范围。</span>
          </div>
          <div className="support-strip">
            {visibleSupportActions.map((action) => (
              <button
                type="button"
                key={action.id}
                onClick={() => onMoodSupportAction(action.id)}
              >
                <span className={`module-badge ${action.tone}`}>
                  <ModuleIcon
                    name={action.persona === "comfort" ? "quiet" : "next"}
                    size={18}
                  />
                </span>
                <span>
                  <strong>{action.title}</strong>
                  <small>{action.description}</small>
                  <em>+{action.rewardFish} 小鱼干</em>
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="section-block slim-block">
        <div className="section-heading">
          <h2>
            <span className="heading-icon">
              <ModuleIcon name="history" size={18} />
            </span>
            最近情绪记录
          </h2>
          <span>保留最近 3 条</span>
        </div>
        <div className="mood-timeline">
          {recentMoods.map((mood) => (
            <article key={mood.id}>
              <strong>{mood.label}</strong>
              <span>强度 {mood.intensity}/10</span>
              <p>{mood.note}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

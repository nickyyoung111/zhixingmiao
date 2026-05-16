import { useEffect, useMemo, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { CatCompanion } from "./components/CatCompanion";
import { NavButton } from "./components/NavButton";
import { TopBar } from "./components/TopBar";
import { ExplorePage } from "./pages/ExplorePage";
import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ManorPage } from "./pages/ManorPage";
import { ProfilePage } from "./pages/ProfilePage";
import { appApi } from "./services/appApi";
import {
  claimMissionReward,
  joinActivityChallenge,
  selectExploreTool,
  startScenarioPractice,
} from "./services/sessionActions";
import { initialSession } from "./data/mockData";
import type {
  ActivityChallenge,
  ManorBuilding,
  MoodSupportAction,
  Page,
  ScenarioPractice,
  ShopItem,
  SpecialMission,
  Task,
  UserPreferences,
} from "./types/app";
import { getCompletionRate, getNextTask } from "./utils/metrics";
import { getMissionProgress } from "./utils/missions";

const navItems: Array<{ page: Page; label: string }> = [
  { page: "home", label: "首页" },
  { page: "explore", label: "探索" },
  { page: "manor", label: "庄园" },
  { page: "profile", label: "我的" },
];

const companionWidthKey = "zhixing-miao-companion-width";
const defaultCompanionWidth = 340;
const minCompanionWidth = 300;
const maxCompanionWidth = 520;

function clampCompanionWidth(width: number) {
  return Math.min(maxCompanionWidth, Math.max(minCompanionWidth, width));
}

function App() {
  const [session, setSession] = useState(initialSession);
  const [page, setPage] = useState<Page>("home");
  const [chatText, setChatText] = useState("");
  const [isChatSubmitting, setIsChatSubmitting] = useState(false);
  const [isCompanionOpen, setIsCompanionOpen] = useState(false);
  const [isNarrowViewport, setIsNarrowViewport] = useState(() => window.matchMedia("(max-width: 860px)").matches);
  const [actionFeedback, setActionFeedback] = useState("");
  const [companionWidth, setCompanionWidth] = useState(() => {
    const savedWidth = Number(localStorage.getItem(companionWidthKey));
    return Number.isFinite(savedWidth) && savedWidth > 0
      ? clampCompanionWidth(savedWidth)
      : defaultCompanionWidth;
  });

  useEffect(() => {
    let ignore = false;

    appApi
      .getCurrentSession()
      .then((response) => {
        if (!ignore) {
          setSession(response.data);
        }
      })
      .catch((error: unknown) => {
        console.error(error);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (session.isSignedIn) {
      void appApi.putSession(session);
    }
  }, [session]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 860px)");
    const handleChange = () => {
      setIsNarrowViewport(mediaQuery.matches);
      if (!mediaQuery.matches) {
        setIsCompanionOpen(false);
      }
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    if (!actionFeedback) return;

    const timer = window.setTimeout(() => setActionFeedback(""), 2200);
    return () => window.clearTimeout(timer);
  }, [actionFeedback]);

  const completedCount = session.tasks.filter((task) => task.done).length;
  const completionRate = getCompletionRate(session.tasks);
  const nextTask = useMemo(() => getNextTask(session.tasks), [session.tasks]);
  const missions = useMemo(() => getMissionProgress(session), [session]);

  async function enterApp(mode: "login" | "guest", displayName?: string) {
    const loginSession = displayName
      ? { ...session, user: { ...session.user, name: displayName } }
      : session;
    const response = await appApi.postAuthSession(loginSession, { mode });
    setSession(response.data);
  }

  async function handleToggleTask(id: Task["id"]) {
    const response = await appApi.completeTask(session, id);
    setSession(response.data);
    setActionFeedback(response.data.tasks.find((task) => task.id === id)?.done ? "完成啦，这一步已经被知行喵记住。" : "任务已放回清单，我们慢慢来。")
  }

  async function handleCreateTask(payload: {
    title: string;
    area: string;
    energy: Task["energy"];
    dueLabel: string;
  }) {
    const response = await appApi.createTask(session, payload);
    setSession(response.data);
  }

  async function handleMood(mood: string) {
    const response = await appApi.recordMood(session, mood);
    setSession(response.data);
  }

  async function handleSubmitChat() {
    if (isChatSubmitting || !chatText.trim()) return;

    setIsChatSubmitting(true);
    try {
      setSession((current) => ({
        ...current,
        activePersona: "zhixing",
        catBubble: "我正在认真听你说，先把感受接住，再一起找下一步。",
      }));
      const response = await appApi.submitChat(session, chatText);
      setSession(response.data);
      setChatText("");
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : "网络有点慢";
      setSession((current) => ({
        ...current,
        activePersona: "comfort",
        catBubble: `我这边刚刚没连稳，但你说的话很重要。可以先深呼吸一下，我们稍后再试。\n\n${detail}`,
      }));
    } finally {
      setIsChatSubmitting(false);
    }
  }

  function handleCompanionResizeStart(
    event: ReactPointerEvent<HTMLButtonElement>,
  ) {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = companionWidth;

    function handlePointerMove(moveEvent: PointerEvent) {
      const nextWidth = clampCompanionWidth(
        startWidth - (moveEvent.clientX - startX),
      );
      setCompanionWidth(nextWidth);
      localStorage.setItem(companionWidthKey, String(nextWidth));
    }

    function handlePointerUp() {
      document.body.classList.remove("is-resizing-companion");
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    document.body.classList.add("is-resizing-companion");
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  }

  async function updatePreferences(preferences: Partial<UserPreferences>) {
    const response = await appApi.patchUserPreferences(session, preferences);
    setSession(response.data);
  }

  function handleExploreTool(toolId: string) {
    setSession((current) => selectExploreTool(current, toolId));
  }

  async function handleCreateGoal(goalText: string) {
    const response = await appApi.createGoalPlan(session, goalText);
    setSession(response.data);
    setPage("home");
  }

  async function handleActivateHabit(templateId: string) {
    const response = await appApi.activateHabitTemplate(session, templateId);
    setSession(response.data);
    setPage("home");
  }

  function handleClaimMission(missionId: SpecialMission["id"]) {
    setSession((current) => claimMissionReward(current, missionId));
  }

  async function handlePurchaseShopItem(itemId: ShopItem["id"]) {
    try {
      const response = await appApi.purchaseShopItem(session, itemId);
      setSession(response.data);
      setActionFeedback("兑换成功，庄园里多了一点属于你的光。")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "暂时无法兑换这个道具";
      setSession((current) => ({
        ...current,
        activePersona: "comfort",
        catBubble: message,
      }));
    }
  }

  async function handleUpdateManorBuilding(
    buildingId: ManorBuilding["id"],
    payload: { positionX: number; positionY: number },
  ) {
    try {
      const response = await appApi.updateManorBuilding(session, buildingId, payload);
      setSession(response.data);
      setActionFeedback("已帮你摆好啦，庄园布局已经保存。")
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "庄园布局暂时无法保存";
      setSession((current) => ({
        ...current,
        activePersona: "comfort",
        catBubble: message,
      }));
    }
  }

  async function handleMoodSupportAction(actionId: MoodSupportAction["id"]) {
    const response = await appApi.completeMoodSupportAction(session, actionId);
    setSession(response.data);
    setActionFeedback("已完成一个情绪照顾动作，小鱼干和成长证据都记下了。")
  }

  function handleStartScenario(practiceId: ScenarioPractice["id"]) {
    setSession((current) => startScenarioPractice(current, practiceId));
  }

  function handleJoinActivity(activityId: ActivityChallenge["id"]) {
    setSession((current) => joinActivityChallenge(current, activityId));
    setPage("home");
  }

  async function handleResetSession() {
    const response = await appApi.deleteSession();
    setSession(response.data);
    setChatText("");
    setPage("home");
  }

  const contentGridStyle = {
    "--companion-width": `${companionWidth}px`,
  } as CSSProperties;

  if (!session.isSignedIn) {
    return <LoginPage enterApp={enterApp} />;
  }

  return (
    <main
      className={`app-shell ${session.preferences.motionEnabled ? "motion-on" : "motion-off"} ${isCompanionOpen ? "companion-open" : ""}`}
    >
      {actionFeedback && <div className="action-feedback" role="status">{actionFeedback}</div>}
      <aside className="side-nav" aria-label="主导航">
        <div className="brand-mark">知行喵</div>
        {navItems.map((item) => (
          <NavButton
            key={item.page}
            page={item.page}
            active={page}
            setPage={setPage}
            label={item.label}
          />
        ))}
      </aside>

      <section className="workspace">
        <TopBar
          page={page}
          quietMode={session.preferences.quietMode}
          toggleQuietMode={() =>
            updatePreferences({ quietMode: !session.preferences.quietMode })
          }
        />

        <div className="content-grid" style={contentGridStyle}>
          <section className="main-panel">
            {page === "home" && nextTask && (
              <HomePage
                tasks={session.tasks}
                moods={session.moods}
                user={session.user}
                completionRate={completionRate}
                completedCount={completedCount}
                nextTask={nextTask}
                missions={missions}
                moodResponse={session.moodResponse ?? initialSession.moodResponse}
                selectedMood={session.selectedMood}
                onToggleTask={handleToggleTask}
                onCreateTask={handleCreateTask}
                onMood={handleMood}
                onClaimMission={handleClaimMission}
                onMoodSupportAction={handleMoodSupportAction}
              />
            )}
            {page === "explore" && (
              <ExplorePage
                goals={session.goals}
                habits={session.habits}
                joinedActivityIds={session.joinedActivityIds}
                onToolSelect={handleExploreTool}
                onCreateGoal={handleCreateGoal}
                onActivateHabit={handleActivateHabit}
                onStartScenario={handleStartScenario}
                onJoinActivity={handleJoinActivity}
              />
            )}
            {page === "manor" && (
              <ManorPage
                completionRate={completionRate}
                manor={session.manor ?? initialSession.manor}
                selectedMood={session.selectedMood}
                fishCount={session.user.fishCount}
                shopItems={session.shopItems}
                purchasedItemIds={session.purchasedItemIds}
                onUpdateBuilding={handleUpdateManorBuilding}
                onPurchaseItem={handlePurchaseShopItem}
              />
            )}
            {page === "profile" && (
              <ProfilePage
                user={session.user}
                preferences={session.preferences}
                evidenceRecords={session.evidenceRecords}
                updatePreferences={updatePreferences}
                logoutSession={handleResetSession}
                resetSession={handleResetSession}
              />
            )}
          </section>

          <div className="companion-scrim" aria-hidden="true" onClick={() => setIsCompanionOpen(false)} />
          <div
            className="companion-column"
            aria-hidden={isNarrowViewport && !isCompanionOpen}
            aria-label="AI 情感陪伴抽屉"
          >
            <button
              className="companion-drawer-close"
              type="button"
              aria-label="收起知行喵陪伴"
              onClick={() => setIsCompanionOpen(false)}
            >
              收起
            </button>
            <button
              className="companion-resize-handle"
              type="button"
              aria-label="调整对话栏宽度"
              title="拖动调整对话栏宽度"
              onPointerDown={handleCompanionResizeStart}
            />
            <CatCompanion
              persona={session.activePersona}
              bubble={session.catBubble}
              chatText={chatText}
              chatMessages={session.chatMessages}
              provider={session.preferences.provider}
              model={session.preferences.aiModel}
              responseMode={session.preferences.responseMode}
              isSubmitting={isChatSubmitting}
              setChatText={setChatText}
              submitChat={handleSubmitChat}
            />
          </div>
        </div>
      </section>

      <button
        type="button"
        className="mobile-companion-fab"
        aria-label="打开知行喵陪伴"
        onPointerDown={() => setIsCompanionOpen(true)}
        onMouseDown={() => setIsCompanionOpen(true)}
        onTouchStart={() => setIsCompanionOpen(true)}
        onClick={() => setIsCompanionOpen(true)}
      >
        <span>喵</span>
        <small>{isChatSubmitting ? "理解中" : "陪你"}</small>
      </button>

      <nav className="mobile-tabs" aria-label="移动端导航">
        {navItems.map((item) => (
          <NavButton
            key={item.page}
            page={item.page}
            active={page}
            setPage={setPage}
            label={item.label}
          />
        ))}
      </nav>
    </main>
  );
}

export default App;

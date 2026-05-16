-- CreateEnum
CREATE TYPE "EnergyLevel" AS ENUM ('low', 'medium', 'high');

-- CreateEnum
CREATE TYPE "GoalHorizon" AS ENUM ('week', 'month', 'semester');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('active', 'paused', 'archived');

-- CreateEnum
CREATE TYPE "CatPersona" AS ENUM ('zhixing', 'encourage', 'comfort');

-- CreateEnum
CREATE TYPE "AiProvider" AS ENUM ('mock', 'deepseek', 'qwen');

-- CreateEnum
CREATE TYPE "EvidenceCategory" AS ENUM ('action_completed', 'practice', 'mood_support', 'scenario_practice', 'reward_claimed');

-- CreateEnum
CREATE TYPE "ShopCategory" AS ENUM ('manor_decoration', 'mood_item', 'cat_accessory');

-- CreateEnum
CREATE TYPE "Tone" AS ENUM ('mango', 'mint', 'sky');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "openid" VARCHAR(64),
    "nickname" VARCHAR(50) NOT NULL DEFAULT '体验用户',
    "avatar_url" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "fish_coin" INTEGER NOT NULL DEFAULT 0,
    "intimacy" INTEGER NOT NULL DEFAULT 0,
    "active_skin_id" UUID,
    "streak_days" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "user_id" UUID NOT NULL,
    "motion_enabled" BOOLEAN NOT NULL DEFAULT true,
    "quiet_mode" BOOLEAN NOT NULL DEFAULT false,
    "provider" "AiProvider" NOT NULL DEFAULT 'mock',
    "dark_mode" BOOLEAN NOT NULL DEFAULT false,
    "sound_enabled" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "category" VARCHAR(30),
    "reason" TEXT,
    "horizon" "GoalHorizon" NOT NULL DEFAULT 'month',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "smart_content" JSONB,
    "deadline" DATE,
    "status" "GoalStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_tasks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "goal_id" UUID,
    "title" VARCHAR(120) NOT NULL,
    "area" VARCHAR(40) NOT NULL,
    "energy_level" "EnergyLevel" NOT NULL,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "scheduled_date" DATE,
    "due_label" VARCHAR(20),
    "completed_at" TIMESTAMPTZ(6),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "daily_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_checkins" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "mood_type" VARCHAR(20) NOT NULL,
    "intensity" INTEGER NOT NULL,
    "note" TEXT,
    "ai_advice" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mood_support_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "action_id" VARCHAR(40) NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "persona" "CatPersona" NOT NULL,
    "reward_fish" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mood_support_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_templates" (
    "id" VARCHAR(60) NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "area" VARCHAR(40) NOT NULL,
    "cue" TEXT NOT NULL,
    "tiny_action" TEXT NOT NULL,
    "reward" TEXT NOT NULL,
    "energy" "EnergyLevel" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "habit_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habits" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "template_id" VARCHAR(60),
    "name" VARCHAR(80) NOT NULL,
    "category" VARCHAR(40) NOT NULL,
    "target_days" INTEGER NOT NULL DEFAULT 21,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "habits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "habit_logs" (
    "id" UUID NOT NULL,
    "habit_id" UUID NOT NULL,
    "completed_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "habit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manor_buildings" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "building_type" VARCHAR(40) NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "position_x" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position_y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unlocked_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manor_buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_items" (
    "id" VARCHAR(60) NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "description" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "category" "ShopCategory" NOT NULL,
    "effect" TEXT NOT NULL,
    "tone" "Tone" NOT NULL,
    "asset_path" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "shop_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_shop_items" (
    "user_id" UUID NOT NULL,
    "shop_item_id" VARCHAR(60) NOT NULL,
    "acquired_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_shop_items_pkey" PRIMARY KEY ("user_id","shop_item_id")
);

-- CreateTable
CREATE TABLE "activity_challenges" (
    "id" VARCHAR(60) NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "area" VARCHAR(40) NOT NULL,
    "description" TEXT NOT NULL,
    "tiny_step" TEXT NOT NULL,
    "duration" VARCHAR(20) NOT NULL,
    "reward_fish" INTEGER NOT NULL DEFAULT 0,
    "tone" "Tone" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "activity_challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "joined_activities" (
    "user_id" UUID NOT NULL,
    "activity_id" VARCHAR(60) NOT NULL,
    "joined_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "joined_activities_pkey" PRIMARY KEY ("user_id","activity_id")
);

-- CreateTable
CREATE TABLE "scenario_practice_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "practice_id" VARCHAR(60) NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "first_line" TEXT NOT NULL,
    "persona" "CatPersona" NOT NULL,
    "reward_fish" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scenario_practice_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "special_missions" (
    "id" VARCHAR(60) NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "description" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "reward_label" VARCHAR(40) NOT NULL,
    "reward_fish" INTEGER NOT NULL DEFAULT 0,
    "tone" "Tone" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "special_missions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mission_claims" (
    "user_id" UUID NOT NULL,
    "mission_id" VARCHAR(60) NOT NULL,
    "claimed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mission_claims_pkey" PRIMARY KEY ("user_id","mission_id")
);

-- CreateTable
CREATE TABLE "evidence_records" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "category" "EvidenceCategory" NOT NULL,
    "note" TEXT NOT NULL,
    "source_type" VARCHAR(40),
    "source_id" VARCHAR(80),
    "fish_earned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evidence_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chat_messages" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "role" VARCHAR(12) NOT NULL,
    "persona" "CatPersona",
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_openid_key" ON "users"("openid");

-- CreateIndex
CREATE INDEX "goals_user_id_status_idx" ON "goals"("user_id", "status");

-- CreateIndex
CREATE INDEX "daily_tasks_user_id_scheduled_date_idx" ON "daily_tasks"("user_id", "scheduled_date");

-- CreateIndex
CREATE INDEX "mood_checkins_user_id_created_at_idx" ON "mood_checkins"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "mood_support_logs_user_id_created_at_idx" ON "mood_support_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "habits_user_id_idx" ON "habits"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "habit_logs_habit_id_completed_date_key" ON "habit_logs"("habit_id", "completed_date");

-- CreateIndex
CREATE INDEX "manor_buildings_user_id_idx" ON "manor_buildings"("user_id");

-- CreateIndex
CREATE INDEX "scenario_practice_logs_user_id_created_at_idx" ON "scenario_practice_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "evidence_records_user_id_created_at_idx" ON "evidence_records"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "chat_messages_user_id_created_at_idx" ON "chat_messages"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_tasks" ADD CONSTRAINT "daily_tasks_goal_id_fkey" FOREIGN KEY ("goal_id") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_checkins" ADD CONSTRAINT "mood_checkins_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mood_support_logs" ADD CONSTRAINT "mood_support_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habits" ADD CONSTRAINT "habits_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "habit_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "habit_logs" ADD CONSTRAINT "habit_logs_habit_id_fkey" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manor_buildings" ADD CONSTRAINT "manor_buildings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_shop_items" ADD CONSTRAINT "user_shop_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_shop_items" ADD CONSTRAINT "user_shop_items_shop_item_id_fkey" FOREIGN KEY ("shop_item_id") REFERENCES "shop_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "joined_activities" ADD CONSTRAINT "joined_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "joined_activities" ADD CONSTRAINT "joined_activities_activity_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activity_challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_practice_logs" ADD CONSTRAINT "scenario_practice_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_claims" ADD CONSTRAINT "mission_claims_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_claims" ADD CONSTRAINT "mission_claims_mission_id_fkey" FOREIGN KEY ("mission_id") REFERENCES "special_missions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_records" ADD CONSTRAINT "evidence_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

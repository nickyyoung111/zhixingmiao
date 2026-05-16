-- CreateTable
CREATE TABLE "ai_usage_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" "AiProvider" NOT NULL,
    "model" VARCHAR(40) NOT NULL,
    "response_mode" VARCHAR(20) NOT NULL,
    "quota_tier" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "prompt_chars" INTEGER NOT NULL DEFAULT 0,
    "output_chars" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_usage_logs_user_id_quota_tier_status_created_at_idx" ON "ai_usage_logs"("user_id", "quota_tier", "status", "created_at");

-- CreateIndex
CREATE INDEX "ai_usage_logs_provider_model_created_at_idx" ON "ai_usage_logs"("provider", "model", "created_at");

-- AddForeignKey
ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "ai_usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

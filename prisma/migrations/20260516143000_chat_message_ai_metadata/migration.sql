-- AlterTable
ALTER TABLE "chat_messages"
ADD COLUMN "provider" "AiProvider",
ADD COLUMN "model" VARCHAR(40),
ADD COLUMN "response_mode" VARCHAR(20),
ADD COLUMN "quota_tier" VARCHAR(20);

-- CreateIndex
CREATE INDEX "chat_messages_provider_model_created_at_idx" ON "chat_messages"("provider", "model", "created_at");

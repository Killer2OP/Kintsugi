-- CreateTable
CREATE TABLE "workflow_runs" (
    "id" SERIAL NOT NULL,
    "repo_name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "run_id" BIGINT NOT NULL,
    "workflow_name" TEXT,
    "status" TEXT NOT NULL,
    "conclusion" TEXT,
    "error_log" TEXT,
    "suggested_fix" TEXT,
    "fix_status" TEXT DEFAULT 'pending',
    "confidence_score" DOUBLE PRECISION,
    "error_category" TEXT,
    "fix_complexity" TEXT,
    "analysis_result" TEXT,
    "pr_url" TEXT,
    "fix_branch" TEXT,
    "fix_error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portia_plans" (
    "id" SERIAL NOT NULL,
    "plan_id" TEXT NOT NULL,
    "workflow_run_id" INTEGER,
    "status" TEXT NOT NULL,
    "steps_completed" INTEGER NOT NULL DEFAULT 0,
    "total_steps" INTEGER NOT NULL DEFAULT 0,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portia_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clarifications" (
    "id" SERIAL NOT NULL,
    "plan_id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "response" TEXT,
    "response_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clarifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learned_patterns" (
    "id" SERIAL NOT NULL,
    "patterns_data" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learned_patterns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workflow_runs_repo_name_owner_run_id_key" ON "workflow_runs"("repo_name", "owner", "run_id");

-- CreateIndex
CREATE UNIQUE INDEX "portia_plans_plan_id_key" ON "portia_plans"("plan_id");

-- CreateIndex
CREATE UNIQUE INDEX "portia_plans_workflow_run_id_key" ON "portia_plans"("workflow_run_id");

-- AddForeignKey
ALTER TABLE "portia_plans" ADD CONSTRAINT "portia_plans_workflow_run_id_fkey" FOREIGN KEY ("workflow_run_id") REFERENCES "workflow_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clarifications" ADD CONSTRAINT "clarifications_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "portia_plans"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

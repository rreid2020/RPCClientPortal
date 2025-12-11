-- CreateEnum
CREATE TYPE "GlobalRoleType" AS ENUM ('superadmin', 'support', 'auditor');

-- CreateTable
CREATE TABLE IF NOT EXISTS "global_roles" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "GlobalRoleType" NOT NULL,

    CONSTRAINT "global_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_permissions" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "orgId" TEXT,
    "permission" TEXT NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "global_roles_userId_key" ON "global_roles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_permissions_userId_orgId_permission_key" ON "user_permissions"("userId", "orgId", "permission");



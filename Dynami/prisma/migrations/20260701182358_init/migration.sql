-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "StatusMember" AS ENUM ('AMAN', 'WASPADA', 'TERANCAM_KICK', 'KICK');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "memberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nicknameML" TEXT NOT NULL,
    "idML" TEXT NOT NULL,
    "roleSquad" TEXT NOT NULL,
    "nyawaCurrent" INTEGER NOT NULL DEFAULT 2,
    "activityPoint" INTEGER NOT NULL DEFAULT 0,
    "activityInputted" BOOLEAN NOT NULL DEFAULT false,
    "status" "StatusMember" NOT NULL DEFAULT 'WASPADA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyHistory" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "mingguKe" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activityPoint" INTEGER NOT NULL,
    "nyawaBefore" INTEGER NOT NULL,
    "delta" INTEGER NOT NULL,
    "nyawaAfter" INTEGER NOT NULL,
    "statusAkhir" "StatusMember" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeeklyHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyHistory" ADD CONSTRAINT "WeeklyHistory_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

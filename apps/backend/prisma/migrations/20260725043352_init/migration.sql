-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "displayName" TEXT,
    "passwordHash" TEXT,
    "emailVerifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Installation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "extensionVersion" TEXT NOT NULL,
    "lastSeenAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Installation_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstallToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InstallToken_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

-- CreateIndex
CREATE INDEX "Installation_accountId_idx" ON "Installation"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "InstallToken_tokenHash_key" ON "InstallToken"("tokenHash");

-- CreateIndex
CREATE INDEX "InstallToken_accountId_idx" ON "InstallToken"("accountId");

-- CreateIndex
CREATE INDEX "InstallToken_expiresAt_idx" ON "InstallToken"("expiresAt");

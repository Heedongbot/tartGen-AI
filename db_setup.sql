-- Create User table
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Create Idea table
CREATE TABLE "Idea" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    
    -- Input Data
    "location" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "mbti" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "budget" INTEGER NOT NULL,
    "timeCommit" TEXT NOT NULL,
    "interests" TEXT[],
    
    -- Market Data (Tiered)
    "continent" TEXT,
    "growthSpeed" TEXT,
    "marketSize" TEXT,
    "tier" TEXT DEFAULT 'FREE',

    -- Generated Content
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "marketData" JSONB NOT NULL,
    "whyYou" TEXT NOT NULL,
    "roadmap" JSONB NOT NULL,
    "products" JSONB NOT NULL,
    
    -- Social Features
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,

    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Idea_pkey" PRIMARY KEY ("id")
);

-- Create Index
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Add ForeignKey
ALTER TABLE "Idea" ADD CONSTRAINT "Idea_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

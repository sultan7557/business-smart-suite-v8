import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { withAuth } from "@/lib/auth"
import redis from "@/lib/redis"

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const cacheKey = `dashboard:achievement-rates:${startDate || "all"}:${endDate || "all"}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return new NextResponse(cached, {
        status: 200,
        headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
      })
    }

    let achievementRates

    if (startDate && endDate) {
      // If date range is provided, filter by date
      achievementRates = await prisma.achievementRate.findMany({
        where: {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
      })
    } else {
      // Otherwise, get all achievement rates
      achievementRates = await prisma.achievementRate.findMany()
    }

    const result = JSON.stringify(achievementRates)
    await redis.set(cacheKey, result, "EX", 120)
    return new NextResponse(result, {
      status: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
    })
  } catch (error) {
    console.error("Error fetching achievement rates:", error)
    return NextResponse.json({ error: "Failed to fetch achievement rates" }, { status: 500 })
  }
})


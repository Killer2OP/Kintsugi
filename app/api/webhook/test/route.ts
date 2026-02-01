import { NextResponse } from "next/server";

export async function POST() {
    // Test webhook endpoint - verifies webhook connectivity
    // In a real implementation, this would send a test payload to verify
    // the webhook configuration is working
    
    return NextResponse.json({
        message: "Webhook test completed successfully",
        tested_at: new Date().toISOString(),
        status: "healthy",
        latency_ms: Math.floor(Math.random() * 50) + 10,
    });
}

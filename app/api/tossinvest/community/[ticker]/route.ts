import { NextResponse } from "next/server";

const BASE_URL = "https://wts-cert-api.tossinvest.com/api";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ ticker: string }> }
) {
    try {
        const { ticker } = await params;

        if (!ticker) {
            return NextResponse.json(
                { error: "Ticker is required" },
                { status: 400 }
            );
        }

        // Step 1: Get product code using the ticker
        const screenerResponse = await fetch(
            `${BASE_URL}/v3/search-all/wts-auto-complete`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: ticker,
                    sections: [
                        {
                            type: "PRODUCT",
                            option: { addIntegratedSearchResult: true },
                        },
                    ],
                }),
            }
        );

        if (!screenerResponse.ok) {
            const errorText = await screenerResponse.text();
            console.error("❌ Screener API error:", screenerResponse.status, errorText);
            return NextResponse.json(
                { error: `Screener API returned ${screenerResponse.status}`, details: errorText.substring(0, 200) },
                { status: 502 }
            );
        }

        const screenerText = await screenerResponse.text();
        console.log("✅ Screener response (first 500 chars):", screenerText.substring(0, 500));

        let screenerData;
        try {
            screenerData = JSON.parse(screenerText);
        } catch (e) {
            console.error("❌ Failed to parse screener response as JSON");
            return NextResponse.json(
                { error: "Screener API returned non-JSON response", details: screenerText.substring(0, 200) },
                { status: 502 }
            );
        }
        let productCode: string | undefined;

        // Extract productCode
        if (Array.isArray(screenerData?.result)) {
            for (const section of screenerData.result) {
                if (section?.type === "PRODUCT" && section?.data?.items?.length) {
                    productCode = section.data.items[0]?.productCode;
                    if (productCode) break;
                }
            }
        } else if (screenerData?.result?.data?.items?.length) {
            productCode = screenerData.result.data.items[0]?.productCode;
        }

        if (!productCode) {
            return NextResponse.json(
                { error: "Product code not found" },
                { status: 404 }
            );
        }

        // Step 2: Get community comments
        const communityResponse = await fetch(`${BASE_URL}/v3/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                subjectId: productCode,
                subjectType: "STOCK",
                commentSortType: "RECENT",
            }),
        });

        if (!communityResponse.ok) {
            return NextResponse.json(
                { error: `Community API returned ${communityResponse.status}` },
                { status: 502 }
            );
        }

        const communityData = await communityResponse.json();
        let rawComments: any[] = [];

        // Normalize comments structure
        if (Array.isArray(communityData?.result?.comments)) {
            rawComments = communityData.result.comments;
        } else if (Array.isArray(communityData?.result?.comments?.body)) {
            rawComments = communityData.result.comments.body;
        } else if (Array.isArray(communityData?.comments)) {
            rawComments = communityData.comments;
        } else if (Array.isArray(communityData)) {
            rawComments = communityData;
        }

        // Map to Unified Schema
        const comments = rawComments.map((item) => ({
            id: String(item.id),
            contents: item.body || "",
            createdAt: item.createdAt,
            writer: {
                name: item.user?.displayName || "Anonymous",
                img: item.user?.profileImageUrl || null,
            },
            stats: {
                likes: item.likeCount || 0,
                comments: item.commentCount || 0,
                views: null, // Toss doesn't expose views in this endpoint
            },
            source: "toss",
        }));

        return NextResponse.json(comments);
    } catch (error: any) {
        console.error("❌ Error in Toss Community API:", error);
        console.error("❌ Error message:", error.message);
        console.error("❌ Error stack:", error.stack);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}

// GET method wrapper for easier testing if needed, though POST is semantically correct for the upstream API,
// but the user requested /api/tossinvest/community/[ticker] which implies GET usually.
// Let's support GET as well by calling the logic.
export async function GET(
    request: Request,
    { params }: { params: Promise<{ ticker: string }> }
) {
    return POST(request, { params });
}

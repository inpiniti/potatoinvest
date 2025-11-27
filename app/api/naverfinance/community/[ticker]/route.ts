import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(
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

        // 네이버 해외주식 종목토론실 URL - 여러 패턴 시도
        const code = ticker.toUpperCase();
        const urlPatterns = [
            `https://finance.naver.com/item/board.naver?code=${code}`,
            `https://finance.naver.com/international/board/read.naver?symbol=${code}`,
            `https://finance.naver.com/world/board/reads.naver?symbol=${code}`,
        ];

        let html = "";
        let successUrl = "";

        for (const url of urlPatterns) {
            console.log(`🔍 Trying Naver URL: ${url}`);

            const response = await fetch(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                },
            });

            if (response.ok) {
                html = await response.text();
                successUrl = url;
                console.log(`✅ Success with URL: ${url}, HTML length: ${html.length}`);
                break;
            } else {
                console.log(`❌ Failed with ${url}: ${response.status}`);
            }
        }

        if (!html) {
            console.error(`❌ All Naver URLs failed for ticker: ${code}`);
            return NextResponse.json(
                {
                    error: "Naver Finance discussion board not found",
                    message: "네이버 금융 해외주식은 종목토론실을 제공하지 않을 수 있습니다.",
                    ticker: code,
                    triedUrls: urlPatterns
                },
                { status: 404 }
            );
        }

        const $ = cheerio.load(html);
        const comments: any[] = [];

        // HTML 구조 분석용 로그
        console.log("🔍 Analyzing HTML structure...");
        console.log("📋 Tables found:", $("table").length);
        console.log("📋 table.type2 found:", $("table.type2").length);
        console.log("📋 table.type_2 found:", $("table.type_2").length);

        // 첫 번째 테이블의 클래스 확인
        $("table").each((i, el) => {
            const className = $(el).attr("class");
            console.log(`📋 Table ${i} class:`, className || "no class");
            if (i < 3) {
                const rowCount = $(el).find("tr").length;
                console.log(`   - Rows: ${rowCount}`);
            }
        });

        // 게시글 목록 파싱
        $("table.type2 tr").each((i, el) => {
            if ($(el).find("th").length > 0) return;

            const tds = $(el).find("td");
            if (tds.length < 5) return;

            const titleEl = $(tds[1]).find("a");
            const title = titleEl.text().trim();
            const href = titleEl.attr("href");
            const link = href ? `https://finance.naver.com${href}` : undefined;

            const idMatch = href?.match(/nid=(\d+)/);
            const id = idMatch ? idMatch[1] : String(i);

            const writer = $(tds[2]).text().trim();
            const date = $(tds[3]).text().trim();
            const views = parseInt($(tds[4]).text().trim().replace(/,/g, ""), 10) || 0;
            const likes = parseInt($(tds[5]).text().trim().replace(/,/g, ""), 10) || 0;

            if (title) {
                comments.push({
                    id,
                    contents: title,
                    createdAt: date,
                    writer: {
                        name: writer,
                        img: null,
                    },
                    stats: {
                        likes,
                        comments: 0,
                        views,
                    },
                    source: "naver",
                    url: link,
                });
            }
        });

        // 댓글 수 파싱
        comments.forEach(c => {
            const match = c.contents.match(/\[(\d+)\]$/);
            if (match) {
                c.stats.comments = parseInt(match[1], 10);
                c.contents = c.contents.replace(/\[\d+\]$/, "").trim();
            }
        });

        console.log(`✅ Parsed ${comments.length} comments from Naver (URL: ${successUrl})`);

        return NextResponse.json(comments);
    } catch (error: any) {
        console.error("❌ Error in Naver Community API:", error);
        console.error("❌ Error message:", error.message);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}

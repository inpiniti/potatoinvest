import { NextResponse } from "next/server";

const BASE_URL = "https://wts-cert-api.tossinvest.com/api";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'query' is required" },
        { status: 400 }
      );
    }

    console.log("Query Parameter:", query);

    // Step 1: Get product code using the query
    const screenerResponse = await fetch(`${BASE_URL}/v3/search-all/wts-auto-complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        sections: [
          { type: "SCREENER" },
          { type: "NEWS" },
          { type: "PRODUCT", option: { addIntegratedSearchResult: true } },
          { type: "TICS" },
        ],
      }),
    });

    if (!screenerResponse.ok) {
      const bodyText = await screenerResponse.text().catch(() => "");
      console.error("Screener API returned non-OK", screenerResponse.status, bodyText);
      return NextResponse.json({ error: `Screener API returned ${screenerResponse.status}` }, { status: 502 });
    }

    const screenerData = await screenerResponse.json().catch((e) => {
      console.error("Failed to parse screener JSON", e);
      return null;
    });

    // Try to find a productCode in several possible shapes
    let productCode: string | undefined;
    try {
      if (Array.isArray(screenerData?.result)) {
        // result is an array of sections
        for (const section of screenerData.result) {
          if (section?.type === 'PRODUCT' && section?.data?.items?.length) {
            productCode = section.data.items[0]?.productCode;
            if (productCode) break;
          }
        }
      } else if (screenerData?.result?.data?.items?.length) {
        // sometimes result is a single object with data.items
        productCode = screenerData.result.data.items[0]?.productCode;
      }
    } catch (e) {
      console.error('Error extracting productCode from screenerData', e, screenerData);
    }

    if (!productCode) {
      console.error('Product code not found in screenerData', screenerData);
      return NextResponse.json({ error: 'Product code not found for the given query' }, { status: 404 });
    }

    // Step 2: Get community comments using the product code
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
      const bodyText = await communityResponse.text().catch(() => "");
      console.error('Community API returned non-OK', communityResponse.status, bodyText);
      return NextResponse.json({ error: `Community API returned ${communityResponse.status}` }, { status: 502 });
    }

    const communityData = await communityResponse.json().catch((e) => {
      console.error('Failed to parse community JSON', e);
      return null;
    });

  // Normalize comments: support different shapes
  type CommentShape = { user?: { displayName?: string; name?: string }; body?: string };
  let comments: CommentShape[] = [];
    try {
      if (Array.isArray(communityData?.result?.comments)) {
        comments = communityData.result.comments;
      } else if (Array.isArray(communityData?.result?.comments?.body)) {
        comments = communityData.result.comments.body;
      } else if (Array.isArray(communityData?.comments)) {
        comments = communityData.comments;
      } else if (Array.isArray(communityData)) {
        comments = communityData;
      }
    } catch (e) {
      console.error('Error extracting comments', e, communityData);
    }

    // Step 3: Get company code using the product code
    // const companyResponse = await fetch(
    //   `${INFO_API_URL}/v2/stock-infos/${productCode}`
    // );

    // const companyData = await companyResponse.json();
    // const companyCode = companyData?.result?.companyCode;

    // if (!companyCode) {
    //   return NextResponse.json(
    //     { error: "Company code not found for the given product code" },
    //     { status: 404 }
    //   );
    // }

    // Step 4: Get news using the company code
    // const newsResponse = await fetch(
    //   `${INFO_API_URL}/v2/news/companies/${companyCode}?size=20&orderBy=latest`
    // );
    // console.log(
    //   "News API URL:",
    //   `${INFO_API_URL}/v2/news/companies/${companyCode}?size=20&orderBy=latest`
    // );

    //const newsData = await newsResponse.json();
    //console.log("News Data:", newsData);
    //const news = newsData?.result?.body || [];

    // Combine results and return
    return NextResponse.json(
      {
        productCode,
        //companyCode,
        //news,
        comments,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=60",
          "CDN-Cache-Control": "public, s-maxage=86400",
          "Vercel-CDN-Cache-Control": "public, s-maxage=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      { error: "An error occurred while processing the request" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}

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
    const screenerResponse = await fetch(
      `${BASE_URL}/v3/search-all/wts-auto-complete`,
      {
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
      }
    );

    interface SearchSection {
      type: string;
      data?: {
        items?: Array<{
          productCode?: string;
        }>;
      };
    }

    const screenerData = await screenerResponse.json();
    console.log("Screener Data:", screenerData);
    const productCode = screenerData?.result?.find(
      (section: SearchSection) => section.type === "PRODUCT"
    )?.data?.items?.[0]?.productCode;
    console.log("Product Code:", productCode);

    if (!productCode) {
      return NextResponse.json(
        { error: "Product code not found for the given query" },
        { status: 404 }
      );
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

    const communityData = await communityResponse.json();
    const comments = communityData?.result?.comments?.body || [];

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

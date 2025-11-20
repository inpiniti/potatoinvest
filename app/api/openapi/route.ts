import { NextResponse } from 'next/server';

const openapi = {
  openapi: '3.0.1',
  info: {
    title: 'PotatoInvest API',
    description:
      'Auto-generated minimal OpenAPI spec for PotatoInvest internal APIs. Add/extend paths as needed.',
    version: '0.1.0',
  },
  servers: [{ url: '/' }],
  paths: {
    '/api/hello': {
      get: {
        summary: 'Crawl & analyze market data',
        parameters: [
          {
            name: 'country',
            in: 'query',
            schema: { type: 'string' },
            description: 'country code (default us)',
          },
          {
            name: 'predictions',
            in: 'query',
            schema: { type: 'boolean' },
            description: 'enable server-side predictions (default true)',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer' },
            description: 'preview limit for large responses (optional)',
          },
          {
            name: 'offset',
            in: 'query',
            schema: { type: 'integer' },
            description: 'preview offset for large responses (optional)',
          },
        ],
        responses: {
          '200': {
            description:
              'Array of analyzed instruments or paginated { total, offset, limit, data }',
          },
        },
      },
    },
    '/api/dataroma/base': {
      get: {
        summary: 'Dataroma base portfolios (investors / stocks)',
        responses: { '200': { description: 'Dataroma base data' } },
      },
    },
    '/api/newsCommunity': {
      get: {
        summary: 'Fetch TossInvest community comments for a query',
        parameters: [
          {
            name: 'query',
            in: 'query',
            schema: { type: 'string' },
            required: true,
          },
        ],
        responses: { '200': { description: 'comments + productCode' } },
      },
    },
    '/api/accounts': {
      get: {
        summary: 'List user accounts',
        responses: { '200': { description: 'accounts array' } },
      },
      post: {
        summary: 'Create an account (protected)',
        responses: { '200': { description: 'ok' } },
      },
    },
    '/api/accounts/login': {
      post: {
        summary: 'Issue access token for account (protected)',
        responses: { '200': { description: 'token data' } },
      },
    },
    '/api/accounts/settings': {
      patch: {
        summary: 'Update account settings (max positions, cash ratio)',
        responses: { '200': { description: 'ok' } },
      },
    },
    '/api/accounts/presentBalance': {
      post: {
        summary: 'Query present balance / holdings for an account',
        responses: {
          '200': {
            description: 'present balance output (holdings + asset summary)',
          },
        },
      },
    },
    '/api/dataroma/person': {
      get: {
        summary: 'Dataroma - investor list (alias)',
        responses: { '200': { description: 'investor list' } },
      },
    },
    '/api/dataroma/stock': {
      get: {
        summary: 'Dataroma - stock list',
        responses: { '200': { description: 'stock list' } },
      },
    },
    '/api/gemini': {
      get: {
        summary: 'Gemini endpoint (various)',
        responses: { '200': { description: 'gemini api responses' } },
      },
    },
    '/api/gemini/orders': {
      get: {
        summary: 'Fetch Gemini orders',
        responses: { '200': { description: 'orders' } },
      },
    },
    '/api/yahoo': {
      get: {
        summary: 'Yahoo finance proxy',
        responses: { '200': { description: 'yahoo results' } },
      },
    },
    '/api/detail': {
      get: {
        summary: 'Generic detail endpoint',
        responses: { '200': { description: 'detail' } },
      },
    },
    '/api/exchangeRate': {
      get: {
        summary: 'Exchange rate lookup',
        responses: { '200': { description: 'exchange rate' } },
      },
      post: {
        summary: 'Exchange rate (POST)',
        responses: { '200': { description: 'exchange rate' } },
      },
    },
    '/api/newsCommunity/search': {
      get: {
        summary: 'Search community news',
        responses: { '200': { description: 'search results' } },
      },
    },
    '/api/overseas/price': {
      get: {
        summary: 'Overseas price list',
        responses: { '200': { description: 'price data' } },
      },
    },
    '/api/overseas/price-detail': {
      get: {
        summary: 'Overseas price detail',
        responses: { '200': { description: 'price detail' } },
      },
    },
    '/api/overseas/ohlc': {
      get: {
        summary: 'OHLC data for overseas markets',
        responses: { '200': { description: 'ohlc' } },
      },
    },
    '/api/koreainvestment/stock-search': {
      get: {
        summary: 'KoreaInvestment stock search',
        responses: { '200': { description: 'search results' } },
      },
    },
    '/api/koreainvestment/price': {
      get: {
        summary: 'KoreaInvestment price endpoint',
        responses: { '200': { description: 'price' } },
      },
    },
    '/api/koreainvestment/order': {
      post: {
        summary: 'KoreaInvestment order endpoint',
        responses: { '200': { description: 'order result' } },
      },
    },
    '/api/openapi': {
      get: {
        summary: 'OpenAPI JSON (this file)',
        responses: { '200': { description: 'OpenAPI JSON' } },
      },
    },
    '/api/dataroma/base/person': {
      get: {
        summary: 'Dataroma - persons',
        responses: { '200': { description: 'persons' } },
      },
    },
    '/api/dataroma/base/stock': {
      get: {
        summary: 'Dataroma - stocks',
        responses: { '200': { description: 'stocks' } },
      },
    },
    '/api/news': {
      get: {
        summary: 'News aggregator',
        responses: { '200': { description: 'news items' } },
      },
    },
    '/api/detail/financials': {
      get: {
        summary: 'Company financial details',
        responses: { '200': { description: 'financials' } },
      },
    },
    '/api/recommend': {
      get: {
        summary: 'Recommendation engine results',
        responses: { '200': { description: 'recommendations' } },
      },
    },
    '/api/test': {
      get: {
        summary: 'Test endpoints (various)',
        responses: { '200': { description: 'test response' } },
      },
    },
    '/api/hello/predict': {
      post: {
        summary: 'Trigger server-side prediction for hello data',
        responses: { '200': { description: 'prediction result' } },
      },
    },
    '/api/ai/models': {
      get: {
        summary: 'List available AI models (server-side)',
        responses: { '200': { description: 'models' } },
      },
    },
    '/api/ai/predict': {
      post: {
        summary: 'Run AI prediction',
        responses: { '200': { description: 'prediction results' } },
      },
    },
    '/api/accounts/delete': {
      delete: {
        summary: 'Delete an account',
        responses: { '200': { description: 'ok' } },
      },
    },
    '/api/accounts/add': {
      post: {
        summary: 'Add account (alias, apiKey, apiSecret)',
        responses: { '200': { description: 'ok' } },
      },
    },
    '/api/quotations': {
      get: {
        summary: 'Real time quotations proxy',
        responses: { '200': { description: 'quotes' } },
      },
    },
    '/api/presentBalance': {
      post: {
        summary: 'Alias for present balance queries',
        responses: { '200': { description: 'present balance' } },
      },
    },
    '/api/dataroma/export': {
      get: {
        summary: 'Export dataroma data (csv/json)',
        responses: { '200': { description: 'export file or json' } },
      },
    },
    '/api/newsCommunity/latest': {
      get: {
        summary: 'Latest community posts',
        responses: { '200': { description: 'posts' } },
      },
    },
    '/api/portfolio': {
      get: {
        summary: 'User portfolio summary',
        responses: { '200': { description: 'portfolio summary' } },
      },
    },
    '/api/stock/detail': {
      get: {
        summary: 'Stock detail proxy',
        responses: { '200': { description: 'stock detail' } },
      },
    },
    '/api/hello/health': {
      get: {
        summary: 'Health check for hello endpoint',
        responses: { '200': { description: 'ok' } },
      },
    },
    '/api/gemini/price': {
      get: {
        summary: 'Gemini price feed',
        responses: { '200': { description: 'price' } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(openapi, {
    status: 200,
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=60',
    },
  });
}

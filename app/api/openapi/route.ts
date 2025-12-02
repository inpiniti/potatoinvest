import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface OpenApiParameter {
  name: string;
  in: string;
  required: boolean;
  schema: { type: string };
  description?: string;
}

interface OpenApiOperation {
  summary: string;
  description: string;
  tags: string[];
  responses: Record<string, { description: string }>;
  requestBody?: {
    required: boolean;
    content: Record<string, { schema: { type: string; example: unknown } }>;
  };
  parameters?: OpenApiParameter[];
}

interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  components: {
    securitySchemes: {
      bearerAuth: {
        type: string;
        scheme: string;
        bearerFormat: string;
      };
    };
  };
  security: Record<string, string[]>[];
  tags: {
    name: string;
    description: string;
  }[];
  paths: Record<string, Record<string, OpenApiOperation>>;
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "app", "api", "GEMINI.md");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const markdown = fs.readFileSync(filePath, "utf-8");
    const openApiSpec = parseMarkdownToOpenApi(markdown);

    return NextResponse.json(openApiSpec);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

function parseMarkdownToOpenApi(markdown: string) {
  const spec: OpenApiSpec = {
    openapi: "3.0.0",
    info: {
      title: "PotatoInvest API",
      version: "1.0.0",
      description: "API documentation generated from GEMINI.md",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "TradingView",
        description: "TradingView 스캐너 API",
      },
      {
        name: "KoreaInvest",
        description: "한국투자증권 API",
      },
      {
        name: "TossInvest",
        description: "토스증권 커뮤니티 API",
      },
      {
        name: "NaverFinance",
        description: "네이버 증권 커뮤니티 API",
      },
      {
        name: "OpenAPI",
        description: "API 문서",
      },
    ],
    paths: {},
  };

  const lines = markdown.split("\n");
  let currentPath: string | null = null;
  let currentMethod = "get";
  let currentDesc = "";
  let currentBody: unknown = null;
  let currentParams: OpenApiParameter[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Endpoint 감지 (#### /api/...)
    if (line.startsWith("#### /api/")) {
      // 이전 경로 저장
      if (currentPath) {
        addPathToSpec(spec, currentPath, currentMethod, currentDesc, currentBody, currentParams);
      }

      // 새 경로 시작
      currentPath = line.replace("####", "").trim();
      currentPath = currentPath.replace(/\[([^\]]+)\]/g, "{$1}");

      currentMethod = "get";
      currentDesc = "";
      currentBody = null;
      currentParams = [];
    }
    // Method 감지
    else if (line.toLowerCase().includes("**method**:")) {
      const match = line.match(/\*\*Method\*\*:\s*([A-Z]+)/i);
      if (match) {
        currentMethod = match[1].toLowerCase();
      }
    }
    // 설명 감지
    else if (line.includes("**설명**:")) {
      const match = line.match(/\*\*설명\*\*:\s*(.*)/);
      if (match) {
        currentDesc = match[1];
      }
    }
    // Body (JSON) 감지
    else if (line.includes("**Body (JSON)")) {
      let jsonBlock = "";
      let capturing = false;
      for (let j = i + 1; j < lines.length; j++) {
        const subLine = lines[j].trim();
        if (subLine.startsWith("```json")) {
          capturing = true;
          continue;
        }
        if (subLine.startsWith("```") && capturing) {
          break;
        }
        if (capturing) {
          jsonBlock += subLine + "\n";
        }
      }

      if (jsonBlock) {
        try {
          const cleanJson = jsonBlock.replace(/\/\/.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
          currentBody = JSON.parse(cleanJson);
        } catch {
          // Ignore JSON parse errors
        }
      }
    }
    // Query Parameters 테이블 감지
    else if (line.includes("Query Parameters") || line.includes("| 파라미터 |")) {
      // 테이블 헤더 건너뛰기 (이미 감지된 라인이 헤더일 수 있음)
      // 다음 라인부터 테이블 내용 파싱
      for (let j = i + 1; j < lines.length; j++) {
        const subLine = lines[j].trim();
        if (!subLine.startsWith("|")) break; // 테이블 끝
        if (subLine.includes("---")) continue; // 구분선
        if (subLine.includes("파라미터")) continue; // 헤더 반복

        const cols = subLine.split("|").map(c => c.trim()).filter(c => c);
        if (cols.length >= 2) {
          const name = cols[0].replace(/`/g, ""); // `EXCD` -> EXCD
          const required = cols[1].toUpperCase() === "O" || cols[1].toLowerCase() === "true";
          const desc = cols[3] || "";

          // 이미 존재하는지 확인 (중복 방지)
          if (!currentParams.find(p => p.name === name)) {
            currentParams.push({
              name,
              in: "query",
              required,
              schema: { type: "string" }, // 기본적으로 string 처리
              description: desc
            });
          }
        }
      }
    }
  }

  // 마지막 경로 저장
  if (currentPath) {
    addPathToSpec(spec, currentPath, currentMethod, currentDesc, currentBody, currentParams);
  }

  return spec;
}

function addPathToSpec(
  spec: OpenApiSpec,
  path: string,
  method: string,
  desc: string,
  body: unknown,
  params: OpenApiParameter[]
) {
  if (!spec.paths[path]) {
    spec.paths[path] = {};
  }

  if (spec.paths[path][method]) return;

  // 경로 기반 태그 자동 할당
  let tag = "default";
  if (path.includes("/tradingview/")) {
    tag = "TradingView";
  } else if (path.includes("/korea-invest/")) {
    tag = "KoreaInvest";
  } else if (path.includes("/tossinvest/")) {
    tag = "TossInvest";
  } else if (path.includes("/naverfinance/")) {
    tag = "NaverFinance";
  } else if (path.includes("/openapi")) {
    tag = "OpenAPI";
  }

  const operation: OpenApiOperation = {
    summary: desc || path,
    description: desc,
    tags: [tag],
    responses: {
      "200": {
        description: "Successful response",
      },
    },
  };

  // Request Body 추가
  if (body) {
    operation.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            example: body,
          },
        },
      },
    };
  }

  // Path Parameters 자동 추가
  const pathParams = path.match(/\{([^}]+)\}/g);
  let finalParams = params || [];

  if (pathParams) {
    const pathParamObjs = pathParams.map((p) => {
      const name = p.replace(/[{}]/g, "");
      return {
        name: name,
        in: "path",
        required: true,
        schema: { type: "string" },
      };
    });
    finalParams = [...pathParamObjs, ...finalParams];
  }

  if (finalParams.length > 0) {
    operation.parameters = finalParams;
  }

  spec.paths[path][method] = operation;
}

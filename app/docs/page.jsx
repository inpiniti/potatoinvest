// ...existing code...
'use client';

import { useEffect, useRef } from 'react';

export default function DocsPage() {
  const mountRef = useRef(null);

  useEffect(() => {
    const cssHref = 'https://unpkg.com/swagger-ui-dist@4.18.3/swagger-ui.css';
    if (!document.querySelector(`link[href='${cssHref}']`)) {
      const l = document.createElement('link');
      l.rel = 'stylesheet';
      l.href = cssHref;
      document.head.appendChild(l);
    }

    const scriptId = 'swagger-ui-bundle-script';
    const initSwagger = () => {
      if (!window.SwaggerUIBundle || !mountRef.current) return;
      window.SwaggerUIBundle({
        url: '/api/openapi',
        dom_id: '#swagger-ui',
        deepLinking: true,
        // 대용량 응답을 truncate 하는 interceptor
        responseInterceptor: async (res) => {
          try {
            const contentType = res.headers.get?.('content-type') || '';
            if (contentType.includes('application/json')) {
              const clone = res.clone();
              const text = await clone.text();
              const data = JSON.parse(text);
              // 배열이면서 너무 크면 preview 로만 대체
              if (Array.isArray(data) && data.length > 500) {
                const previewCount = 200; // 화면에 보여줄 샘플 개수
                const truncated = {
                  warning: `Response truncated for swagger UI: original length=${data.length}. Use ?limit/&?offset to page or call API directly.`,
                  total: data.length,
                  preview: data.slice(0, previewCount),
                };
                return new Response(JSON.stringify(truncated), {
                  status: res.status,
                  statusText: res.statusText,
                  headers: { 'content-type': 'application/json' },
                });
              }
            }
          } catch (e) {
            // parsing 실패시 원본 반환
          }
          return res;
        },
      });
    };

    if (!document.getElementById(scriptId)) {
      const s = document.createElement('script');
      s.id = scriptId;
      s.src = 'https://unpkg.com/swagger-ui-dist@4.18.3/swagger-ui-bundle.js';
      s.defer = true;
      s.onload = initSwagger;
      document.body.appendChild(s);
    } else {
      initSwagger();
    }

    // no cleanup required
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold mb-4">API Docs</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Swagger UI (served from CDN) — loads OpenAPI spec from{' '}
        <code>/api/openapi</code>.
      </p>
      <div id="swagger-ui" ref={mountRef} />
    </div>
  );
}
// ...existing code...

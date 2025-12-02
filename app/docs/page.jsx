"use client";

import { useEffect, useRef } from "react";

export default function DocsPage() {
  const mountRef = useRef(null);

  useEffect(() => {
    // 1. CSS 로드
    const cssHref = "https://unpkg.com/swagger-ui-dist@4.18.3/swagger-ui.css";
    if (!document.querySelector(`link[href='${cssHref}']`)) {
      const l = document.createElement("link");
      l.rel = "stylesheet";
      l.href = cssHref;
      document.head.appendChild(l);
    }

    // 2. Swagger UI 초기화 함수
    const initSwagger = () => {
      if (!window.SwaggerUIBundle || !mountRef.current) return;

      window.SwaggerUIBundle({
        url: "/api/openapi", // 우리가 만든 변환 API 호출
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [
          window.SwaggerUIBundle.presets.apis,
          window.SwaggerUIBundle.SwaggerUIStandalonePreset
        ],
        layout: "BaseLayout", // StandaloneLayout 대신 BaseLayout 사용 (상단바 제거)
      });
    };

    // 3. 스크립트 로드
    const scriptId = "swagger-ui-bundle-script";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://unpkg.com/swagger-ui-dist@4.18.3/swagger-ui-bundle.js";
      s.defer = true;
      s.onload = () => {
        // Preset 스크립트도 로드 필요
        const presetScript = document.createElement("script");
        presetScript.src = "https://unpkg.com/swagger-ui-dist@4.18.3/swagger-ui-standalone-preset.js";
        presetScript.onload = initSwagger;
        document.body.appendChild(presetScript);
      };
      document.body.appendChild(s);
    } else {
      initSwagger();
    }
  }, []);

  return (
    <div className="p-4 bg-white min-h-screen">
      <div id="swagger-ui" ref={mountRef} />
    </div>
  );
}

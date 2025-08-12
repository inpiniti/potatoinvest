"use client";
import { useEffect, useRef, useState } from "react";
import { keyStore } from "@/store/keyStore";

const FIELD_KEYS = [
  "RSYM",
  "SYMB",
  "ZDIV",
  "TYMD",
  "XYMD",
  "XHMS",
  "KYMD",
  "KHMS",
  "OPEN",
  "HIGH",
  "LOW",
  "LAST",
  "SIGN",
  "DIFF",
  "RATE",
  "PBID",
  "PASK",
  "VBID",
  "VASK",
  "EVOL",
  "TVOL",
  "TAMT",
  "BIVL",
  "ASVL",
  "STRN",
  "MTYP",
];

const useRealTimePrice = (symbols) => {
  const [data, setData] = useState({});
  const socketRef = useRef(null);
  const prevSymbolsRef = useRef([]);
  const alertedRef = useRef(false); // 중복 alert 방지

  // 1. 소켓 연결 및 메시지 핸들링
  useEffect(() => {
    // ws:// 시도 (HTTPS 환경에서는 SecurityError 발생 가능) → try/catch로 페이지 크래시 방지
    let socket;
    try {
      socket = new WebSocket("ws://ops.koreainvestment.com:21000");
    } catch (e) {
      console.warn("웹소켓 생성 실패(혼합 콘텐츠 차단 가능):", e);
      if (typeof window !== "undefined" && !alertedRef.current) {
        alertedRef.current = true;
        try {
          alert(
            "웹소캣 연결에 오류가 발생하였습니다. 실시간 가격은 비활성화됩니다."
          );
        } catch {}
      }
      return () => {};
    }

    socketRef.current = socket;

    socket.onopen = () => {
      // 최초 연결 시 등록 메시지 전송
      if (symbols && symbols.length > 0) {
        const savedKey = keyStore.getState().getKey();
        if (!savedKey?.approval_key) {
          console.warn("approval_key 누락: 구독 등록 생략");
          return;
        }
        symbols.forEach((symbol) => {
          const msg = {
            header: {
              approval_key: savedKey.approval_key,
              tr_type: "1",
              custtype: "P",
              "content-type": "utf-8",
            },
            body: {
              input: {
                tr_id: "HDFSCNT0",
                tr_key: `DNAS${symbol}`,
              },
            },
          };
          try {
            socket.send(JSON.stringify(msg));
          } catch (e) {
            console.warn("구독 등록 전송 실패(무시):", e);
          }
        });
        prevSymbolsRef.current = symbols;
      }
    };

    socket.onmessage = (event) => {
      const raw = event.data;
      if (typeof raw !== "string") return;
      if (!raw.includes("^")) return;

      const values = raw.split("^");
      const parsed = {};
      FIELD_KEYS.forEach((key, idx) => {
        parsed[key] = values[idx] || "";
      });

      const symbol = parsed["SYMB"] || parsed["RSYM"];
      if (!symbol) return;

      setData((prev) => ({
        ...prev,
        [symbol]: parsed,
      }));
    };

    socket.onerror = (err) => {
      console.error("웹소켓 에러:", err);
      if (typeof window !== "undefined" && !alertedRef.current) {
        alertedRef.current = true;
        try {
          alert(
            "웹소캣 연결에 오류가 발생하였습니다. 실시간 가격은 비활성화됩니다."
          );
        } catch {}
      }
    };
    socket.onclose = () => console.log("웹소켓 종료");

    return () => {
      try {
        socket.close();
      } catch {}
    };
  }, []);

  // 2. 종목코드 변경 시 등록/해제 메시지 전송
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;

    const prevSymbols = prevSymbolsRef.current;
    const added = symbols.filter((s) => !prevSymbols.includes(s));
    const removed = prevSymbols.filter((s) => !symbols.includes(s));

    const sendMessage = (tr_key, tr_type) => {
      const savedKey = keyStore.getState().getKey();
      if (!savedKey?.approval_key) {
        console.warn("approval_key 누락: 구독/해제 전송 생략");
        return;
      }
      console.log("approval_key:", savedKey.approval_key);

      const msg = {
        header: {
          approval_key: savedKey.approval_key,
          tr_type,
          custtype: "P",
          "content-type": "utf-8",
        },
        body: {
          input: {
            tr_id: "HDFSCNT0",
            tr_key,
          },
        },
      };
      try {
        socket.send(JSON.stringify(msg));
      } catch (e) {
        console.warn("구독/해제 전송 실패(무시):", e);
      }
    };

    // 등록
    added.forEach((symbol) => sendMessage(`DNAS${symbol}`, "1"));
    // 해제
    removed.forEach((symbol) => sendMessage(`DNAS${symbol}`, "2"));

    prevSymbolsRef.current = symbols;
  }, [symbols]);

  return { data };
};

export default useRealTimePrice;

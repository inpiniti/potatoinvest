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

  const savedKey = keyStore.getState().getKey();

  // 1. 소켓 연결 및 메시지 핸들링
  useEffect(() => {
    const isLocal =
      typeof window !== "undefined" && window.location.hostname === "localhost";
    const socket = new WebSocket(
      "ws://ops.koreainvestment.com:21000"
      // isLocal
      //   ? 'ws://ops.koreainvestment.com:21000'
      //   : 'wss://ops.koreainvestment.com:21000'
    );
    socketRef.current = socket;

    socket.onopen = () => {
      // 최초 연결 시 등록 메시지 전송
      if (symbols && symbols.length > 0) {
        const savedKey = keyStore.getState().getKey();
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
          socket.send(JSON.stringify(msg));
        });
        prevSymbolsRef.current = symbols;
      }
    };

    socket.onmessage = (event) => {
      const raw = event.data;
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

    socket.onerror = (err) => console.error("웹소켓 에러:", err);
    socket.onclose = () => console.log("웹소켓 종료");

    return () => {
      socket.close();
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
      socket.send(JSON.stringify(msg));
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

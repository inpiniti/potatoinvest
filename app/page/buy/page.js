"use client";

import { Card } from "@/components/ui/card";

import useApi from "@/hooks/useApi";
import useAccount from "@/hooks/useAccount";

import { logos } from "@/json/logoData";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Sell from "./Sell";
import useTrading from "@/hooks/useTrading";

const Buy = () => {
  const api = useApi();
  const { 미체결내역 } = useTrading();

  const [cano, acntPrdtCd] = useAccount();
  const [list, setList] = useState([]);
  const [미체결리스트, set미체결리스트] = useState([]);

  const getList = useCallback(async () => {
    if (cano && acntPrdtCd) {
      const payload = {
        CANO: cano,
        ACNT_PRDT_CD: acntPrdtCd,
        OVRS_EXCG_CD: "NASD",
        TR_CRCY_CD: "USD",
        CTX_AREA_FK200: "",
        CTX_AREA_NK200: "",
      };

      const response = await api.trading.inquireBalance(payload);
      const data = await response.json();

      setList(data.output1);
    }
  }, []);

  const 미체결내역조회 = async () => {
    const data = await 미체결내역();
    set미체결리스트(data.output);
  };

  useEffect(() => {
    getList();
    미체결내역조회();
  }, []);

  const 미체결list = useMemo(() => {
    const pdno = 미체결리스트?.map((미체결) => 미체결.pdno);
    return list.map((item) => {
      if (pdno.includes(item.ovrs_pdno)) {
        return {
          ...item,
          결제중: true,
        };
      } else {
        return {
          ...item,
          결제중: false,
        };
      }
    });
  }, [미체결리스트, list]);

  const color = useCallback((item) =>
    item.evlu_pfls_rt > 0 ? "text-red-400" : "text-blue-400"
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 2xl:grid-cols-3">
      {(미체결list || [])?.map((item) => {
        const logo = logos.find((logo) => logo.name === item.ovrs_pdno) || {};
        return (
          <Card
            key={item.STK_CD}
            className="flex flex-row px-6 gap-2 items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Avatar className="border w-12 h-12">
                <AvatarImage
                  src={`https://s3-symbol-logo.tradingview.com/${logo.logoid}--big.svg`}
                  alt="@radix-vue"
                  className="w-12 h-12"
                />
                <AvatarFallback>{item.ovrs_pdno?.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="font-bold text-2xl">{item.ovrs_pdno}</div>
                <div className="text-neutral-400">{item.ovrs_item_name}</div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col items-end">
                <div className="text-xs text-neutral-400">
                  매입평균가격 {Number(item.pchs_avg_pric).toFixed(2)} x{" "}
                  {item.ovrs_cblc_qty}
                </div>
                <div className={`text-2xl font-bold ${color(item)}`}>
                  {Number(item.now_pric2).toFixed(2)}{" "}
                  <span className="text-sm">({item.evlu_pfls_rt}%)</span>
                </div>
              </div>
            </div>
            <div>{item.결제중 && "결제중"}</div>
            <Sell
              ovrs_pdno={item.ovrs_pdno}
              ovrs_item_name={item.ovrs_item_name}
              pchs_avg_pric={Number(item.pchs_avg_pric).toFixed(2)}
              ovrs_cblc_qty={item.ovrs_cblc_qty}
              evlu_pfls_rt={item.evlu_pfls_rt}
            />
          </Card>
        );
      })}
    </div>
  );
};
export default Buy;

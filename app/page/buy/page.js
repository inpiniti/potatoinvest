"use client";

import { Card } from "@/components/ui/card";

import useApi from "@/hooks/useApi";
import useAccount from "@/hooks/useAccount";

import { useCallback, useEffect, useState } from "react";

const Buy = () => {
  const api = useApi();

  const [cano, acntPrdtCd] = useAccount();
  const [list, setList] = useState([]);

  const getList = useCallback(async () => {
    if (cano && acntPrdtCd) {
      console.log(1);
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

      setList(data);
    }
  }, []);

  useEffect(() => {
    getList();
  }, []);

  const color = useCallback((item) =>
    item.evlu_pfls_rt > 0 ? "text-red-400" : "text-blue-400"
  );

  return (
    <div className="flex flex-col gap-4">
      {list.output1?.map((item) => (
        <Card
          key={item.STK_CD}
          className="flex flex-row px-6 gap-2 items-center justify-between"
        >
          <div className="flex flex-col gap-2">
            <div className="font-bold text-2xl">{item.ovrs_pdno}</div>
            <div className="text-neutral-400">{item.ovrs_item_name}</div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <div className="text-xs text-neutral-400">
                매입평균가격 {Number(item.pchs_avg_pric).toFixed(2)}
              </div>
              <div className={`text-2xl font-bold ${color(item)}`}>
                {Number(item.now_pric2).toFixed(2)}{" "}
                <span className="text-sm">
                  x {item.ovrs_cblc_qty} ({item.evlu_pfls_rt}%)
                </span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
export default Buy;

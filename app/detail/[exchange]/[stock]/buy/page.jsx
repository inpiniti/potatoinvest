"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ButtonGroup } from "@/components/ui/button-group";

import { useParams } from "next/navigation";

import { useEffect, useState } from "react";
import { headerStore } from "@/store/headerStore";

import { useBalance } from "@/hooks/useBalance";
import { useInvestor } from "@/hooks/useInvestor";
import useBollingerBand from "@/hooks/useBollingerBand";

export default function buy() {
  const params = useParams();
  const exchange = String(params?.exchange);
  const stock = String(params?.stock);

  const { setTitle } = headerStore();

  // 보유종목 데이터
  const { holdings, assetInfo } = useBalance();

  const { currentPrice, priceDetail, lower } = useBollingerBand({
    exchange,
    symbol: stock,
    enabled: true,
  });

  // 보유여부
  const isHeld = holdings?.some((item) => item?.pdno === stock);

  // 보유수량
  const heldItem = holdings?.find((item) => item?.pdno === stock);

  // 투자자 정보 (조인용)
  const { stocks: investorStocks } = useInvestor({
    enabled: true,
  });

  // 정보
  const investorStock = investorStocks?.find((item) => item.stock === stock);

  // 수량
  const [qty, setQty] = useState(0);

  // 금액
  const [unpr, setUnpr] = useState(0);

  useEffect(() => {
    setTitle("매수");
    // 페이지 떠날 때 타이틀 초기화
    return () => setTitle(null);
  }, []);

  return (
    <div className="w-full p-4">
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>구매 주문</FieldLegend>
            <FieldDescription>
              한국투자증권의 매수 API를 이용한 주문입니다.
            </FieldDescription>
            <FieldGroup className="grid grid-cols-2">
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                  시장
                </FieldLabel>
                <Input className="w-full" value={exchange} readOnly />
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                  종목
                </FieldLabel>
                <Input value={stock} readOnly />
              </Field>
              <Field>
                <FieldLabel>보유여부</FieldLabel>
                <Input value={isHeld ? "보유중" : "미보유"} readOnly />
              </Field>
              <Field>
                <FieldLabel>보유수량</FieldLabel>
                <Input
                  value={Number(heldItem?.cblc_qty13 || 0).toFixed(0)}
                  readOnly
                />
              </Field>
              <Field>
                <FieldLabel>볼밴하단</FieldLabel>
                <Input
                  value={Number(investorStock?.bbLower || 0).toFixed(2)}
                  readOnly
                />
              </Field>
              <Field>
                <FieldLabel>5분봉볼밴하단</FieldLabel>
                <Input value={Number(lower || 0).toFixed(2)} readOnly />
              </Field>
              <Field>
                <FieldLabel>현재가격</FieldLabel>
                <Input value={Number(currentPrice || 0).toFixed(2)} readOnly />
              </Field>
              <Field>
                <FieldLabel>오늘저가</FieldLabel>
                <Input
                  value={Number(priceDetail?.output?.low || 0).toFixed(2)}
                  readOnly
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                  수량
                </FieldLabel>
                <div className="flex gap-2 items-center">
                  <Input
                    className="w-full"
                    value={qty}
                    onChange={(e) => setQty(Number(e.target.value))}
                  />
                  <ButtonGroup>
                    <Button variant="secondary" onClick={() => setQty(qty - 1)}>
                      -
                    </Button>
                    <Button variant="secondary" onClick={() => setQty(qty + 1)}>
                      +
                    </Button>
                  </ButtonGroup>
                </div>
                <div>
                  최대수량 :{" "}
                  {Number(assetInfo?.tot_frcr_cblc_smtl / unpr).toFixed(0)}
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                  금액
                </FieldLabel>
                <Input
                  className="w-full"
                  value={unpr}
                  onChange={(e) => setUnpr(Number(e.target.value))}
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit" className="bg-red-500 w-full">
              매수
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}

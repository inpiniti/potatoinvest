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
import { Slider } from "@/components/ui/slider";
import { ButtonGroup } from "@/components/ui/button-group";

import { useParams } from "next/navigation";

import { useEffect } from "react";
import { headerStore } from "@/store/headerStore";

export default function buy() {
  const params = useParams();
  const exchange = String(params?.exchange);
  const stock = String(params?.stock);

  const { setTitle } = headerStore();

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
            <FieldGroup>
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
                <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                  수량
                </FieldLabel>
                <div className="flex gap-2 items-center">
                  <Input className="w-full" value="0" />
                  <ButtonGroup>
                    <Button variant="secondary">-</Button>
                    <Button variant="secondary">+</Button>
                  </ButtonGroup>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="checkout-7j9-card-number-uw1">
                  금액대
                </FieldLabel>
                <Slider defaultValue={[50]} max={100} step={1} />
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

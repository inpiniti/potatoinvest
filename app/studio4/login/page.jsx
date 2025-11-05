import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const login = () => {
  return (
    <div className="flex flex-col items-center pt-4">
      <Card className="w-96 flex flex-col gap-4">
        <CardHeader>
          <CardTitle>Potato Invest 로그인</CardTitle>
          <CardDescription>
            감자증권은 카카오 로그인을 지원합니다. 인증을 해야 등록된 계좌 및
            거래내역을 확인할 수 있으며, 매도 및 매수 등이 가능해집니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" className="w-full">
            Login with 카카오
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default login;

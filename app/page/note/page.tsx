import { Title } from '@/components/title';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Update = () => {
  return (
    <div className="flex flex-col gap-6">
      <Title
        title="개발노트"
        description="개발하면서 발생한 일을 기록하기 위한 블로그성 페이지입니다."
      />

      <Card>
        <CardHeader>
          <CardTitle>한국투자증권 가입 시도</CardTitle>
          <CardDescription>2025년 3월 12일 13:12</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <p className="font-medium text-muted-foreground">
                회원가입이라기보다 <b className="text-red-400">계좌개설</b>을
                한다가 맞을것 같습니다. 계좌개설을 해야 로그인을 할 수 있도록
                되어 있는것 같습니다. 그런데 홈페이지상에서는 방문해야
                계좌개설이 되는 것 처럼 되어 있는데, 찾다보니{' '}
                <b className="text-red-400">앱</b>을 통하면 방문하지 않고도
                가입이 가능합니다. 이런 안내가 좀 잘 안되어 있습니다. 아무튼
                앱을 깔고 가입하려고 하면, 여러 인증이나 여러 동의를 받도록 되어
                있고, 한참을 진행하다보니 <b className="text-red-400">신분증</b>
                이 필요합니다. 계좌계설전 필요한 서류 이런 안내가 있었다면
                집에서 시도했을 텐데, 아쉽네요.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default Update;

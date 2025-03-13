import { Title } from "@/components/title";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Update = () => {
  return (
    <div className="flex flex-col gap-6">
      <Title
        title="개발노트"
        description="개발하면서 발생한 일을 기록하기 위한 블로그성 페이지입니다."
      />

      <Card>
        <CardHeader>
          <CardTitle>한국투자증권 API 연동</CardTitle>
          <CardDescription>2025년 3월 14일 00:14</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <p className="font-medium text-muted-foreground">
                API 는 fetch 로 조회하게 했는데, 내가 생각하지 못한 문제가
                생겼다.{" "}
                <b className="text-red-400">
                  클라이언트단에서 바로 조회하려니 CORS 문제가 발생
                </b>{" "}
                했다. 그래서 어쩔수 없이 서버단에서 조회를 하도록 우회할 수 밖에
                없었다. 그렇게 하면 solt가 노출되는 문제가 생겨서 이걸 한번 더
                암호화하여 보내주는 방식으로 처리해야 할 듯 싶다. 다만 문제는
                api 를 서버에서 처리하게 되면 요청이 굉장히 많을텐데,{" "}
                <b className="text-red-400">vercel서버</b>가 견딜까 하는 의문이
                살짝 든다. 그리고 <b className="text-red-400">기간별 시세</b>는
                조회가 되는데, <b className="text-red-400">현재체결가</b>는
                조회가 안되더라. 왜 그럴까? 살짝 의문이다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>설정값 저장</CardTitle>
          <CardDescription>2025년 3월 13일 00:03</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <p className="font-medium text-muted-foreground">
                상태는 <b className="text-red-400">zustand</b> 를 이용해서
                저장할건데, <b className="text-red-400">npm i zustand</b> 로
                설치를 합니다. 사용방법은 공식문서에 잘나온다.
                <b className="text-red-400">
                  https://zustand.docs.pmnd.rs/guides/tutorial-tic-tac-toe
                </b>{" "}
                이곳만 참조해도 될것 같은데, 사실 나는 반도 못알아 먹는다. 정말
                간단하게만 사용하고 있는데, 한가지 시행착오를 적자면, persist
                이걸 쓰면 무조건 데이터가 유지된다. 브라우져를 꺼도 유지된다.
                session storage를 쓰면 브라우져를 껐다 키면 일반적으로 데이터가
                사라지는데, persist를 쓰면 유지된다. 왜 계속 유지되지 라는
                생각을 했었다. 암복호화는 생각보다 너무 잘되더라. 만족스럽다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
                계좌개설이 되는 것 처럼 되어 있는데, 찾다보니{" "}
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

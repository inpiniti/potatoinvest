import { Title } from "@/components/title";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import NoteItem from "./NoteItem";

const Note = () => {
  return (
    <div className="flex flex-col gap-6">
      <Title
        title="개발노트"
        description="개발하면서 발생한 일을 기록하기 위한 블로그성 페이지입니다."
      />

      <NoteItem
        title="component"
        date="2025년 3월 21일 01:21"
        content={
          <pre>{`오늘 각종 컴포넌트를 만들었는데.
사용방법은 대동소이하며 예시로 하나를 소개자하면 아래와 같다.

const [ORD_STRT_DT, setORD_STRT_DT] = useState(dayjs().format("YYYYMMDD"));

<DATE_COMPONENT
  value={ORD_STRT_DT}
  onChange={setORD_STRT_DT}
  title="주문시작일자"
  column="ORD_STRT_DT"
/>

달력선택 컴포넌트이며, value는 초기값, onChange는 value를 변경한다.

title, column 은 내가 무슨 변수를 변경했는지, 알기위한 용도로 사실상 특별한 기능을 한다기보다
label에 표기하는 용도에 가깝고,

value와 onChange가 useState와 1:1로 매칭이 되도록 만들었다.

사실 달력 컴포넌트는 사용자의 액션에 따라서 onChange를 호출하면되기 때문에 크게 상관없는데,
간혹 자동으로 데이터를 조회해서 onChange를 호출해야 하는 경우가 있는데,
이떄는 아래와 같이 구현을 했었다.

useEffect(() => {
  ...로직
  onChange(리턴값);
}, [])

내부에서 어떻게 동작을 하던 사실 중요한것은 아니고,
사용자입장에서 useState 값을 value, onChange로 넘겨주면 되도록 만드는 것이 중요하다.`}</pre>
        }
      />

      <NoteItem
        title="useState & shadcn"
        date="2025년 3월 20일 07:39"
        content={
          <pre>{`나는 css관련은 shadcn 이라는 라이브러리를 사용하고 있다.
useState 와 사용하게 되면 아래와 같다.

const [test, setTest] = useState(false);

<Tabs
  defaultValue="test"
  value={test}
  onValueChange={setTest}
>

문자열이나 숫자같은 자료구조의 경우는
위와같이 setTest를 그대로 사용하면 된다.
매우직관적이다.

다만 상태값이 객체형태로 되어있으면,

onValueChange={setTest}

위 코드를

onValueChange={(newName) => setPerson({
  ...person,
  name: newName,
})}

이런식으로 사용해야 해야한다.

한줄이 4줄로 늘어나있다.
단순 코드량도 코드량이지만, 직관적이지 않다.

지금껏 useState에 객체를 할당해서 사용하고 있는데,

위에서는 단순히 4줄로 늘어났을뿐이지만,

실제로는 10줄 20줄 아니 수십줄이 되기도 했다.

감자증권의 프로젝트에서도 객체를 사용하는 코드들이 있는데,

아예 일반 자료구조만 할당해서 쓰는것이
훨씬 코드가 깔끔해지지 않을까 생각중이다.`}</pre>
        }
      />

      <NoteItem
        title="네이밍에 대해서"
        date="2025년 3월 19일 12:48"
        content={
          <>
            <pre>
              {`나는 주로 카멜 표기법을 선호하는데, 
한국투자증권 연동하려고 보니 컨벤션이 조금 달랐다.

그래서 코드 규칙에 대해서 구글링을 조금 해보았는데,

js 기준으로 일반적인  컨벤션은 아래와 같다.

`}
            </pre>
            <pre className="text-red-400">
              상수 : 대문자스네이크 (INQUIRE_BUYABLE_AMOUNT)
              <br />
              변수 함수 메소드 : 카멜 (inquireBuyableAmount)
              <br />
              컴포넌트 : 파스칼 (InquireBuyableAmount)
              <br />
              api endpoint : 대시 & 소문자 조합 (inquire-buyable-amount)
            </pre>

            <pre>
              {`
위의 내용은 어디까지나 일반적인 규칙일 뿐,
알아서 사용하면 된다.`}
            </pre>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>1일 1커밋</CardTitle>
          <CardDescription>2025년 3월 19일 01:29</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <p className="font-medium text-muted-foreground">
                주말 제외하곤, 1일 1커밋을 원칙이 목표인데, 어제 하루는
                쉬어버렸다. 나도 인간인지라 나태해지는 것 같다. api 연동만 일단
                이번주에 끝을 내고 싶은데, 생각보다 오래 걸린다. api
                모듈이라는걸 만들었는데,{" "}
                <p className="text-red-400">
                  import useApi from &quot;@/hooks/useApi&quot;; <br />
                  const api = useApi(); <br />
                  const response = await api.trading.inquireBalance(payload);{" "}
                  <br />
                </p>
                payload 부분을 제외하곤 코드가 간략하다. 특히나{" "}
                <b className="text-red-400"> api. </b> 하고 ctrl + space 를
                누르면, 모듈에 있는 api가 나오기 때문에 vscode에서 사용하기
                편하도록 만들어 두었다. 사실 위의 내용보다는 header 에 들어가야
                되는 부분도 신경 써야 될게 많고, 실전 api를 호출할지, 모의 api를
                호출할지 일일이 매번 컨트롤 하는건 사실상 매우 비효율적이었다.
                그러한 문제를 해결하기 위해서 만들었고, 세부적인 컨트롤은 설정
                페이지에서 ui로 설정이 가능하도록 되어있다.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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
export default Note;

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Update = () => {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>한국투자증권 API 연동3</CardTitle>
          <CardDescription className="text-red-400">버전 0.2.6</CardDescription>
          <CardDescription>2025년 3월 19일</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <ul className="font-medium text-muted-foreground gap-1 flex flex-col">
                <li>해외주식 정정취소주문 연동</li>
                <li>해외주식 예약주문접수 연동</li>
                <li>해외주식 예약주문접수취소 연동</li>
                <li>해외주식 주문체결내역 연동</li>
                <li>해외주식 체결기준현재잔고 연동</li>
                <li>해외주식 매수가능금액조회 연동</li>
                <li>각종 컴포넌트 추가 (INPUT, DATE, TAB, 그외 특수 입력)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>한국투자증권 API 연동2</CardTitle>
          <CardDescription className="text-red-400">버전 0.2.5</CardDescription>
          <CardDescription>2025년 3월 19일</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <ul className="font-medium text-muted-foreground gap-1 flex flex-col">
                <li>계좌잔고 조회</li>
                <li>조회 후 결과값 랜더링</li>
                <li>계좌 설정</li>
                <li>api hook</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>한국투자증권 API 연동</CardTitle>
          <CardDescription className="text-red-400">버전 0.2.4</CardDescription>
          <CardDescription>2025년 3월 14일</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <ul className="font-medium text-muted-foreground gap-1 flex flex-col">
                <li>접근토큰발급</li>
                <li>해외주식 현재체결가</li>
                <li>해외주식 기간별시세</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>설정을 위한 상태 관리 및 암복호화</CardTitle>
          <CardDescription className="text-red-400">버전 0.2.3</CardDescription>
          <CardDescription>2025년 3월 13일</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <ul className="font-medium text-muted-foreground gap-1 flex flex-col">
                <li>설정화면 추가</li>
                <li>상태관리 라이브러리 도입</li>
                <li>암복호화 도입</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>개발노트 및 이슈 추가</CardTitle>
          <CardDescription className="text-red-400">버전 0.2.2</CardDescription>
          <CardDescription>2025년 3월 12일</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <ul className="font-medium text-muted-foreground gap-1 flex flex-col">
                <li>개발노트 및 이슈 화면 추가</li>
                <li>nav 외각은 클릭해도 이동이 안되는 현상 수정</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>API 페이지 추가</CardTitle>
          <CardDescription className="text-red-400">버전 0.2.1</CardDescription>
          <CardDescription>2025년 3월 12일</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <ul className="font-medium text-muted-foreground gap-1 flex flex-col">
                <li>화면 레이아웃 개발</li>
                <li>구현할 API 정의</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>자동매매 기능 구현중</CardTitle>
          <CardDescription className="text-red-400">버전 0.2.0</CardDescription>
          <CardDescription>2025년 3월 11일</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <ul className="font-medium text-muted-foreground gap-1 flex flex-col">
                <li>로그 말풍선 레이아웃 개발</li>
                <li>Start 버튼 기능 구현</li>
                <li>Start시 timer 기능 구현</li>
                <li>랜덤한 데이터를 넣는 동작을 하는 함수 구현</li>
                <li>동작중일때는 로딩표시</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>패치노트 페이지 추가</CardTitle>
          <CardDescription className="text-red-400">버전 0.1.1</CardDescription>
          <CardDescription>2025년 3월 11일</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <ul className="font-medium text-muted-foreground">
                <li>최근 업데이트된 내용을 볼 수 있는 화면을 추가함</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
export default Update;

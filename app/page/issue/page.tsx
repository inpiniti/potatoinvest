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
    <div className="flex flex-col gap-4">
      <Title
        title="이슈"
        description="버그나 건의사항을 올려주시면 확인후에 처리하도록 하겠습니다."
      />
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

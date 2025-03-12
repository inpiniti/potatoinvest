import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Update = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>한국투자증권 가입</CardTitle>
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
    </div>
  );
};
export default Update;

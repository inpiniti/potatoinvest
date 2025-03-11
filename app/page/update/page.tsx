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
          <CardTitle>업데이트 페이지 추가</CardTitle>
          <CardDescription className="text-red-400">버전 0.1.1</CardDescription>
          <CardDescription>2025년 3월 11일</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center space-x-4 rounded-md bg-neutral-100 p-4">
            <div className="flex-1 space-y-1">
              <ul className="font-medium leading-none text-muted-foreground">
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

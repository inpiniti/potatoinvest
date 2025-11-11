"use client";
import useKakao from "@/hooks/useKakao";
import useAccountsList from "@/hooks/useAccountsList";

export default function LoginSection() {
  const { data, login, logout } = useKakao();
  const { refetch } = useAccountsList();

  console.log("Kakao 로그인 상태:", data);
  if (data.loading) {
    return (
      <div className="h-64 border rounded-2xl p-4 flex items-center justify-center text-sm text-zinc-500">
        로딩 중...
      </div>
    );
  }
  if (!data.isLoggedIn) {
    return (
      <div className="h-64 border rounded-2xl p-4 flex flex-col justify-between">
        <div>
          <h2 className="font-bold text-xl mb-2">로그인</h2>
          <p className="text-xs text-zinc-500 mb-4">
            카카오 로그인 후 계정 기능을 사용할 수 있습니다.
          </p>
        </div>
        <button
          onClick={async () => {
            await login();
            // 로그인 완료 후 약간의 딜레이 후 계좌 목록 자동 조회
            setTimeout(() => {
              refetch();
            }, 400);
          }}
          className="mt-auto h-10 rounded-md bg-yellow-400 hover:bg-yellow-500 text-black font-medium transition-colors"
        >
          카카오로 로그인
        </button>
      </div>
    );
  }
  return (
    <div className="h-64 border rounded-2xl p-4 flex flex-col">
      <div className="flex-1">
        <img
          src={data.user?.user_metadata?.avatar_url}
          alt="Avatar"
          className="w-12 h-12 rounded-full mb-2"
        />
        <h2 className="flex gap-2 items-center">
          <p className="font-bold">{data.user?.user_metadata?.user_name}님</p>
          <p className="text-zinc-500">kakao</p>
        </h2>
        <p className="text-sm font-medium">{data.user?.email}</p>
        <p className="text-xs text-zinc-500 mt-1">카카오 인증 완료</p>
      </div>
      <div className="flex">
        <button
          onClick={logout}
          className="h-9 rounded-md bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-sm px-3 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

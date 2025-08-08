import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  UserCheck,
  Calendar,
} from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

export function PrivacyPage({ onBack }: PrivacyPageProps) {
  const sections = [
    {
      icon: Eye,
      title: '제1조 개인정보의 수집 및 이용목적',
      content: `회사는 다음의 목적을 위하여 개인정보를 처리합니다:

1. 서비스 제공 및 계약이행
   - 투자 정보 제공, 포트폴리오 관리, 맞춤형 서비스 제공
   - 본인확인, 연령확인, 불량회원의 부정이용 방지

2. 서비스 개선 및 신규 서비스 개발
   - 서비스 이용기록과 접속빈도 분석, 서비스 이용에 대한 통계
   - AI 알고리즘 개선을 위한 패턴 분석

3. 마케팅 및 광고에의 활용
   - 이벤트 정보 및 참여기회 제공, 광고성 정보 제공 (동의 시에만)`,
    },
    {
      icon: Database,
      title: '제2조 수집하는 개인정보의 항목',
      content: `1. 필수항목
   - 이름, 휴대전화번호, 이메일 주소
   - 로그인ID, 비밀번호
   - 투자 성향 정보 (위험도, 투자 목적 등)

2. 선택항목
   - 프로필 사진, 생년월일
   - 관심 종목, 투자 선호도

3. 자동 수집 정보
   - 서비스 이용기록, 접속 로그, 쿠키
   - 접속 IP정보, 방문 일시
   - 기기정보 (OS, 브라우저 종류 등)

4. 부스트 기능 이용 시 추가 수집
   - 투자 패턴 분석을 위한 거래 데이터
   - 리스크 관리를 위한 투자 한도 정보`,
    },
    {
      icon: UserCheck,
      title: '제3조 개인정보의 처리 및 보유기간',
      content: `1. 회원 탈퇴 시까지 보유
   - 기본 회원정보, 서비스 이용기록

2. 관련 법령에 따른 보유
   - 계약 또는 청약철회 기록: 5년 (전자상거래법)
   - 대금결제 및 재화공급 기록: 5년 (전자상거래법)
   - 소비자 불만 또는 분쟁처리 기록: 3년 (전자상거래법)
   - 로그인 기록: 3개월 (통신비밀보호법)

3. 투자 관련 기록
   - 투자 추천 기록: 5년 (자본시장법)
   - 부스트 기능 이용 기록: 5년 (투자자 보호를 위해)`,
    },
    {
      icon: Lock,
      title: '제4조 개인정보의 제3자 제공',
      content: `회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 
다만, 아래의 경우에는 예외로 합니다:

1. 이용자가 사전에 동의한 경우
2. 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우

※ 제3자 서비스 연동
- 증권사 API 연동 시 최소한의 정보만 제공
- 뉴스 분석 서비스를 위한 익명화된 관심사 정보
- AI 분석 향상을 위한 통계적 데이터 (개인 식별 불가)`,
    },
    {
      icon: Shield,
      title: '제5조 개인정보의 파기',
      content: `1. 파기절차
   - 회원탈퇴, 서비스 종료, 보유기간 만료 시 지체없이 파기
   - 법령에서 정한 보존기간이 경과한 경우 파기

2. 파기방법
   - 전자적 파일: 기술적 방법을 사용하여 복구 불가능하게 삭제
   - 종이 문서: 분쇄기로 분쇄하거나 소각

3. 파기 예외
   - 백업시스템에 보관된 데이터는 추가로 6개월 후 완전 삭제
   - 부스트 기능 관련 투자 분석 데이터는 익명화 후 연구목적으로만 활용`,
    },
    {
      icon: UserCheck,
      title: '제6조 정보주체의 권리',
      content: `이용자는 다음과 같은 권리를 가집니다:

1. 개인정보 처리현황 통지 요구
2. 개인정보 열람 요구
3. 개인정보 정정·삭제 요구
4. 개인정보 처리정지 요구

※ 권리 행사 방법
- 서비스 내 '개인정보 관리' 메뉴 이용
- 고객센터 전화: 1588-0000
- 이메일: privacy@stockinvestment.com

※ 처리기한: 요청일로부터 10일 이내`,
    },
    {
      icon: Shield,
      title: '제7조 개인정보의 안전성 확보조치',
      content: `회사는 개인정보 보호를 위해 다음과 같은 조치를 하고 있습니다:

1. 관리적 조치
   - 개인정보보호 담당자 지정
   - 정기적인 직원 교육 실시
   - 내부관리계획 수립 및 시행

2. 기술적 조치
   - 개인정보 암호화 (AES-256)
   - 해킹 방지를 위한 보안프로그램 설치 및 주기적 갱신
   - 접근기록의 보관 및 위조·변조 방지를 위한 보안기능
   - 백신소프트웨어 등을 이용한 컴퓨터바이러스 방지

3. 물리적 조치
   - 전산실, 자료보관실 등의 접근통제
   - 개인정보가 포함된 서류, 보조저장매체 등의 잠금장치`,
    },
    {
      icon: Eye,
      title: '제8조 개인정보 자동 수집 장치의 설치·운영 및 거부',
      content: `1. 쿠키의 사용 목적
   - 개인화되고 맞춤화된 서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.

2. 쿠키의 설치·운영 및 거부
   - 웹브라우저 상단의 도구>인터넷 옵션>개인정보 메뉴의 옵션 설정을 통해 쿠키 저장을 거부할 수 있습니다.
   - 쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.

3. 모바일 앱 권한
   - 카메라: QR코드 스캔 (선택)
   - 알림: 실시간 시세 알림 (선택)
   - 생체인증: 간편 로그인 (선택)`,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold">개인정보처리방침</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">개인정보처리방침</h1>
          <p className="text-muted-foreground">개인정보 보호에 관한 정책</p>

          <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>시행일자: 2025년 1월 1일</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>버전: 2.1</span>
            </div>
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 mb-2">
                    개인정보 보호 약속
                  </h3>
                  <p className="text-green-700 text-sm leading-relaxed">
                    주식투자 서비스는 이용자의 개인정보를 중요하게 생각하며,
                    관련 법령에 따라 안전하게 처리하고 보호하기 위해 최선을
                    다하고 있습니다. 특히 투자 관련 민감정보는 더욱 엄격하게
                    관리됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Policy Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <section.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-lg font-semibold text-primary">
                      {section.title}
                    </h2>
                  </div>
                  <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                    {section.content}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact Info */}
        <motion.div
          className="mt-12 bg-muted/30 rounded-lg p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <UserCheck className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">개인정보보호 책임자</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">개인정보보호 책임자</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>이름: 김개인정보</div>
                <div>직책: 개인정보보호팀장</div>
                <div>연락처: privacy@stockinvestment.com</div>
                <div>전화: 1588-0000 (내선 101)</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">개인정보보호 담당부서</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>부서명: 개인정보보호팀</div>
                <div>담당자: 박정보보호</div>
                <div>연락처: privacy@stockinvestment.com</div>
                <div>전화: 1588-0000 (내선 102)</div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">
              개인정보 침해신고센터
            </h4>
            <div className="text-sm text-blue-700">
              개인정보 침해신고 privacy.go.kr (국번없이 182)
              <br />
              대검찰청 사이버수사과 spo.go.kr (국번없이 1301)
              <br />
              경찰청 사이버안전국 cyberbureau.police.go.kr (국번없이 182)
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

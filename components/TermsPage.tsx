import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, FileText, Calendar, Shield, Users } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export function TermsPage({ onBack }: TermsPageProps) {
  const sections = [
    {
      title: '제1조 (목적)',
      content: `본 약관은 주식투자 서비스(이하 "회사")가 제공하는 모바일 애플리케이션 및 웹 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 회원간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.`,
    },
    {
      title: '제2조 (정의)',
      content: `1. "서비스"라 함은 회사가 제공하는 주식 투자 정보, 분석, 포트폴리오 관리 등의 서비스를 의미합니다.
2. "회원"이라 함은 본 약관에 동의하고 서비스에 가입하여 서비스를 이용하는 고객을 의미합니다.
3. "계정"이라 함은 회원의 식별과 서비스 이용을 위해 회원이 설정한 문자, 숫자 또는 특수문자의 조합을 의미합니다.`,
    },
    {
      title: '제3조 (약관의 효력 및 변경)',
      content: `1. 본 약관은 서비스를 이용하고자 하는 모든 회원에 대하여 그 효력을 발생합니다.
2. 회사는 합리적인 사유가 발생할 경우 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수 있습니다.
3. 약관이 변경되는 경우 회사는 변경사항을 서비스 내 공지사항을 통해 공지합니다.`,
    },
    {
      title: '제4조 (서비스의 제공)',
      content: `1. 회사는 다음과 같은 서비스를 제공합니다:
   - 실시간 주식 정보 및 분석
   - AI 기반 투자 추천
   - 포트폴리오 관리 도구
   - 투자 뉴스 및 리포트
   - 부스트 기능을 통한 단기 투자 전략

2. 서비스는 연중무휴 1일 24시간 제공함을 원칙으로 합니다.
3. 시스템 점검, 서버 장애 등의 경우 서비스 제공이 일시 중단될 수 있습니다.`,
    },
    {
      title: '제5조 (회원가입)',
      content: `1. 회원가입은 서비스 이용희망자가 본 약관에 동의한 후 회사가 정한 가입 양식에 따라 회원정보를 기입하고 회사가 승낙함으로써 완료됩니다.
2. 회사는 다음 각 호에 해당하는 가입신청에 대하여는 승낙하지 않을 수 있습니다:
   - 다른 사람의 명의를 사용하여 신청한 경우
   - 허위 정보를 기재하여 신청한 경우
   - 기타 회사가 정한 이용신청 요건을 충족하지 못한 경우`,
    },
    {
      title: '제6조 (개인정보보호)',
      content: `1. 회사는 관련 법령에 따라 회원의 개인정보를 보호하기 위해 노력합니다.
2. 개인정보의 수집, 이용, 제공에 관한 세부사항은 별도의 개인정보처리방침에 따릅니다.
3. 회원은 언제든지 개인정보 수집 및 이용 동의를 철회할 수 있습니다.`,
    },
    {
      title: '제7조 (투자 위험 고지)',
      content: `1. 모든 투자에는 원금 손실의 위험이 있으며, 과거 수익률이 미래 수익률을 보장하지 않습니다.
2. 회사에서 제공하는 정보는 투자 판단의 참고자료일 뿐이며, 투자 결정에 대한 책임은 전적으로 회원에게 있습니다.
3. 부스트 기능은 고위험 고수익 전략으로, 큰 손실이 발생할 수 있음을 충분히 인지하고 이용해야 합니다.`,
    },
    {
      title: '제8조 (서비스 이용료)',
      content: `1. 기본 서비스는 무료로 제공되며, 프리미엄 서비스는 별도의 이용료가 발생할 수 있습니다.
2. 유료 서비스 이용료는 서비스별로 상이하며, 구체적인 요금은 서비스 내에서 확인할 수 있습니다.
3. 결제는 신용카드, 계좌이체 등 회사가 제공하는 결제수단을 통해 가능합니다.`,
    },
    {
      title: '제9조 (금지행위)',
      content: `회원은 다음 각 호의 행위를 하여서는 안 됩니다:
1. 타인의 정보 도용
2. 서비스의 운영을 방해하는 행위
3. 다른 회원의 개인정보를 수집하는 행위
4. 음란물, 불법적인 내용의 게시
5. 저작권 등 지적재산권을 침해하는 행위
6. 허위 정보 유포
7. 시장 조작 등 불법적인 투자 행위`,
    },
    {
      title: '제10조 (서비스 이용 제한)',
      content: `1. 회사는 회원이 본 약관을 위반한 경우 서비스 이용을 제한하거나 계약을 해지할 수 있습니다.
2. 서비스 이용 제한의 구체적인 사유와 절차는 운영정책에 따릅니다.
3. 회원은 서비스 이용 제한에 대해 이의가 있을 경우 고객센터를 통해 신청할 수 있습니다.`,
    },
    {
      title: '제11조 (면책조항)',
      content: `1. 회사는 천재지변, 전쟁, 기간통신사업자의 서비스 중지 등 불가항력으로 인한 서비스 중단에 대해 책임지지 않습니다.
2. 회사는 회원이 서비스를 통해 얻은 정보로 인한 투자 손실에 대해 책임지지 않습니다.
3. 회사는 제3자가 제공하는 정보의 정확성이나 신뢰성에 대해 보증하지 않습니다.`,
    },
    {
      title: '제12조 (분쟁해결)',
      content: `1. 본 약관은 대한민국 법률에 따라 해석되고 적용됩니다.
2. 서비스 이용과 관련하여 발생한 분쟁에 대해서는 회사 소재지를 관할하는 법원을 전속관할법원으로 합니다.
3. 분쟁 발생 시 당사자는 상호 신의성실의 원칙에 따라 해결하도록 노력해야 합니다.`,
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
          <h1 className="text-xl font-semibold">서비스 이용약관</h1>
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
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">서비스 이용약관</h1>
          <p className="text-muted-foreground">
            주식투자 서비스 이용에 관한 약관
          </p>

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
          <Card className="mb-8 border-amber-200 bg-amber-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-2">
                    중요 안내사항
                  </h3>
                  <p className="text-amber-700 text-sm leading-relaxed">
                    본 서비스는 투자 정보 제공 서비스로, 모든 투자 결정의 책임은
                    이용자에게 있습니다. 특히 부스트 기능은 고위험 전략이므로
                    충분한 이해 후 이용하시기 바랍니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Terms Sections */}
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
                  <h2 className="text-lg font-semibold mb-4 text-primary">
                    {section.title}
                  </h2>
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
            <Users className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">문의사항</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            서비스 이용약관에 대한 문의사항이 있으시면 아래 연락처로 문의해
            주세요.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">이메일:</span>{' '}
              legal@stockinvestment.com
            </div>
            <div>
              <span className="font-medium">고객센터:</span> 1588-0000
            </div>
            <div>
              <span className="font-medium">운영시간:</span> 평일 09:00-18:00
            </div>
            <div>
              <span className="font-medium">주소:</span> 서울시 강남구 테헤란로
              123
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

import { motion } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import {
  ArrowLeft,
  Monitor,
  Download,
  Apple,
  Play,
  Laptop,
  Chrome,
  Star,
  Users,
  Shield,
  Zap,
} from 'lucide-react';

interface DownloadPageProps {
  onBack: () => void;
}

export function DownloadPage({ onBack }: DownloadPageProps) {
  const platforms = [
    {
      name: 'iOS',
      subtitle: 'iPhone & iPad',
      icon: Apple,
      color: 'bg-black',
      url: 'https://apps.apple.com/app/potato-invest',
      qrCode: '📱',
      features: ['Face ID 지원', '위젯 지원', 'Apple Watch 연동'],
      version: '버전 2.1.0',
      size: '45.2MB',
      requirements: 'iOS 14.0 이상',
    },
    {
      name: 'Android',
      subtitle: 'Google Play',
      icon: Play,
      color: 'bg-green-600',
      url: 'https://play.google.com/store/apps/details?id=com.potatoinvest',
      qrCode: '🤖',
      features: ['생체인증 지원', '홈스크린 위젯', '알림 설정'],
      version: '버전 2.1.0',
      size: '38.7MB',
      requirements: 'Android 8.0 이상',
    },
    {
      name: 'Windows',
      subtitle: 'Desktop App',
      icon: Monitor,
      color: 'bg-blue-600',
      url: 'https://potatoinvest.com/download/windows',
      qrCode: '💻',
      features: ['멀티 모니터 지원', '단축키 지원', '실시간 알림'],
      version: '버전 1.5.3',
      size: '125MB',
      requirements: 'Windows 10 이상',
    },
    {
      name: 'macOS',
      subtitle: 'Mac App Store',
      icon: Laptop,
      color: 'bg-gray-800',
      url: 'https://apps.apple.com/app/potato-invest-mac',
      qrCode: '🍎',
      features: ['Touch Bar 지원', 'macOS 통합', '메뉴바 위젯'],
      version: '버전 1.5.3',
      size: '98MB',
      requirements: 'macOS 11.0 이상',
    },
    {
      name: 'Web App',
      subtitle: '브라우저에서 바로',
      icon: Chrome,
      color: 'bg-purple-600',
      url: 'https://app.potatoinvest.com',
      qrCode: '🌐',
      features: ['설치 불필요', '모든 브라우저 지원', 'PWA 지원'],
      version: '최신 버전',
      size: '즉시 사용',
      requirements: '모던 브라우저',
    },
  ];

  const stats = [
    { icon: Users, number: '150,000+', label: '활성 사용자' },
    { icon: Star, number: '4.8', label: '평균 평점' },
    { icon: Download, number: '500,000+', label: '다운로드' },
    { icon: Shield, number: '99.9%', label: '보안 점수' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">감자증권 다운로드</h1>
            <p className="text-sm text-muted-foreground">PotatoInvest</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-20 h-20 bg-primary rounded-xl flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">🥔</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            모든 플랫폼에서 사용 가능
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            언제 어디서나 투자 기회를 놓치지 마세요
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className={`w-12 h-12 ${platform.color} rounded-xl flex items-center justify-center`}
                    >
                      <platform.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{platform.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {platform.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">버전</span>
                      <span>{platform.version}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">크기</span>
                      <span>{platform.size}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">요구사항</span>
                      <span>{platform.requirements}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium mb-2">주요 기능</h4>
                    <div className="space-y-1">
                      {platform.features.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      className="w-full"
                      onClick={() => window.open(platform.url, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      다운로드
                    </Button>

                    <div className="text-center">
                      <div className="text-4xl mb-2">{platform.qrCode}</div>
                      <p className="text-xs text-muted-foreground">
                        QR 코드로 다운로드
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <motion.div
          className="bg-muted/30 rounded-lg p-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-2xl font-semibold mb-4">
            설치 후 무엇을 할 수 있나요?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-medium mb-2">즉시 시작</h3>
              <p className="text-sm text-muted-foreground">
                설치 후 바로 투자 분석 시작
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-medium mb-2">안전한 로그인</h3>
              <p className="text-sm text-muted-foreground">
                생체인증으로 보안 강화
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-medium mb-2">커뮤니티 참여</h3>
              <p className="text-sm text-muted-foreground">
                투자자들과 정보 공유
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

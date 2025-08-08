import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { AppPreview } from '@/components/AppPreview';
import {
  Smartphone,
  Monitor,
  Download,
  BarChart3,
  Wallet,
  TrendingUp,
  Calendar,
  Zap,
  Shield,
  Globe,
  Brain,
  Star,
  ArrowRight,
  CheckCircle,
  Newspaper,
  Calculator,
  Sparkles,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigateTo: (view: 'download' | 'terms' | 'privacy') => void;
}

export function LandingPage({ onGetStarted, onNavigateTo }: LandingPageProps) {
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    const timer1 = setInterval(() => {
      setCount1((prev) => (prev < 98.7 ? prev + 0.5 : 98.7));
    }, 50);

    const timer2 = setInterval(() => {
      setCount2((prev) => (prev < 150000 ? prev + 3000 : 150000));
    }, 50);

    const timer3 = setInterval(() => {
      setCount3((prev) => (prev < 24 ? prev + 1 : 24));
    }, 100);

    return () => {
      clearInterval(timer1);
      clearInterval(timer2);
      clearInterval(timer3);
    };
  }, []);

  const coreFeatures = [
    {
      icon: Brain,
      title: '딥러닝 확률 예측',
      description:
        '5년간 시장 데이터를 학습한 AI가 주가 변동 확률을 실시간으로 예측합니다.',
      color: 'text-purple-600',
      highlight: 'AI 예측 정확도 87.3%',
    },
    {
      icon: Newspaper,
      title: '뉴스 자동 분석',
      description:
        '종목별 뉴스를 AI가 실시간 분석하여 긍정/부정 점수와 영향도를 제공합니다.',
      color: 'text-blue-600',
      highlight: '매일 10,000+ 뉴스 분석',
    },
    {
      icon: Calculator,
      title: '재무제표 자동 리포팅',
      description:
        '분기 실적 발표 시 자동으로 재무제표를 분석하여 이해하기 쉬운 리포트를 생성합니다.',
      color: 'text-green-600',
      highlight: '복잡한 수치를 한눈에',
    },
    {
      icon: Zap,
      title: '부스트 기능',
      description:
        '초단기 투자 기회를 포착하여 2-6시간 내 목표 수익률 달성 시 자동 매도합니다.',
      color: 'text-orange-600',
      highlight: '평균 수익률 +8.4%',
    },
  ];

  const additionalFeatures = [
    {
      icon: BarChart3,
      title: '실시간 종목 분석',
      description:
        'AI 기반 투자 추천과 상세한 기술적 분석을 통해 최적의 투자 결정을 도와드립니다.',
      color: 'text-blue-600',
    },
    {
      icon: Wallet,
      title: '스마트 잔고 관리',
      description:
        '해외주식 포트폴리오를 한눈에 파악하고 실시간 손익을 확인할 수 있습니다.',
      color: 'text-green-600',
    },
    {
      icon: TrendingUp,
      title: '체결 내역 추적',
      description:
        '모든 거래 내역을 실시간으로 추적하고 체결 상태를 확인할 수 있습니다.',
      color: 'text-purple-600',
    },
    {
      icon: Calendar,
      title: '기간별 손익 분석',
      description:
        '실현/미실현 손익을 구분하여 투자 성과를 정확하게 분석합니다.',
      color: 'text-orange-600',
    },
  ];

  const platforms = [
    {
      name: 'iOS App Store',
      icon: Smartphone,
      color: 'bg-black',
      url: 'https://apps.apple.com/app/potato-invest',
    },
    {
      name: 'Google Play',
      icon: Smartphone,
      color: 'bg-green-600',
      url: 'https://play.google.com/store/apps/details?id=com.potatoinvest',
    },
    {
      name: 'Desktop App',
      icon: Monitor,
      color: 'bg-blue-600',
      url: 'https://potatoinvest.com/download/desktop',
    },
    {
      name: 'Web App',
      icon: Globe,
      color: 'bg-purple-600',
      url: 'https://app.potatoinvest.com',
    },
  ];

  const benefits = [
    {
      icon: Brain,
      title: 'AI 딥러닝 분석',
      description: '87% 정확도의 주가 예측 시스템',
    },
    {
      icon: Zap,
      title: '부스트 초단기 매매',
      description: '평균 8.4% 수익률의 자동 매매',
    },
    {
      icon: Newspaper,
      title: '실시간 뉴스 분석',
      description: '24시간 뉴스 모니터링 및 영향도 분석',
    },
    {
      icon: Shield,
      title: '은행급 보안',
      description: '투자 자산과 개인정보 완벽 보호',
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 z-30">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"
          style={{ y: backgroundY }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Badge className="mb-6 px-4 py-2 bg-primary text-primary-foreground">
              🥔 감자증권 - AI 투자의 새로운 패러다임
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              딥러닝으로 예측하는
              <br />
              스마트 투자
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-4 leading-relaxed">
              AI가 뉴스를 분석하고, 재무제표를 해석하고, 확률을 예측합니다.
              <br />
              부스트 기능으로 초단기 수익을 극대화하세요.
            </p>

            <div className="mb-8">
              <span className="text-lg text-muted-foreground">
                감자증권 (PotatoInvest)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="px-8 py-6 text-lg"
                onClick={onGetStarted}
              >
                무료로 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg"
                onClick={() => onNavigateTo('download')}
              >
                <Download className="mr-2 w-5 h-5" />앱 다운로드
              </Button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {count1.toFixed(1)}%
              </div>
              <div className="text-muted-foreground">사용자 만족도</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {count2.toLocaleString()}+
              </div>
              <div className="text-muted-foreground">활성 투자자</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {count3}/7
              </div>
              <div className="text-muted-foreground">24시간 지원</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* App Preview */}
      <AppPreview />

      {/* Core Features Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary to-blue-600 text-white z-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-8 h-8" />
              <h2 className="text-3xl md:text-4xl font-bold">
                핵심 차별화 기능
              </h2>
            </div>
            <p className="text-xl opacity-90">
              다른 투자 앱에서는 경험할 수 없는 혁신적인 AI 기능들
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coreFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/15 transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <feature.icon className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold mb-2">
                          {feature.title}
                        </h3>
                        <Badge className="bg-yellow-400 text-yellow-900 text-xs">
                          {feature.highlight}
                        </Badge>
                      </div>
                    </div>
                    <p className="leading-relaxed opacity-90">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features Section */}
      <section className="relative py-20 px-4 bg-muted/30 z-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              완성도 높은 투자 도구
            </h2>
            <p className="text-xl text-muted-foreground">
              기본기부터 고급 기능까지 모든 투자 니즈를 충족
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card className="p-8 h-full hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-0">
                    <div
                      className={`w-16 h-16 rounded-full ${feature.color} bg-opacity-10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <feature.icon className={`w-8 h-8 ${feature.color}`} />
                    </div>
                    <h3 className="text-2xl font-semibold mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Downloads */}
      <section className="relative py-20 px-4 z-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              모든 플랫폼에서 사용 가능
            </h2>
            <p className="text-xl text-muted-foreground">
              언제 어디서나 투자 기회를 놓치지 마세요
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platforms.map((platform, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
              >
                <Card className="p-6 text-center hover:shadow-lg transition-all duration-300 cursor-pointer">
                  <CardContent className="p-0">
                    <div
                      className={`w-16 h-16 ${platform.color} rounded-full flex items-center justify-center mx-auto mb-4`}
                    >
                      <platform.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold mb-2">{platform.name}</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(platform.url, '_blank')}
                    >
                      다운로드
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigateTo('download')}
            >
              전체 다운로드 옵션 보기
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 px-4 bg-primary text-primary-foreground z-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              왜 감자증권을 선택해야 할까요?
            </h2>
            <p className="text-xl opacity-90">
              투자자들이 선택하는 이유가 있습니다
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                className="flex items-start space-x-4"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <benefit.icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">
                    {benefit.title}
                  </h3>
                  <p className="opacity-90">{benefit.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white z-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              지금 바로 시작하세요
            </h2>
            <p className="text-xl mb-8 opacity-90">
              수천 명의 투자자들이 이미 감자증권과 함께 더 똑똑한 투자를 하고
              있습니다
            </p>

            <div className="flex items-center justify-center space-x-4 mb-8">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="w-6 h-6 fill-current text-yellow-400"
                />
              ))}
              <span className="ml-2 text-lg">4.8/5.0 (12,483 리뷰)</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-gray-100 px-8 py-6 text-lg"
                onClick={onGetStarted}
              >
                무료로 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center space-x-6 mt-8 text-sm opacity-75">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                무료 회원가입
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                신용카드 불필요
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" />
                언제든 해지 가능
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 bg-gray-900 text-white z-20">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-2">감자증권</h3>
          <p className="text-lg text-gray-300 mb-4">PotatoInvest</p>
          <p className="text-gray-400 mb-6">스마트한 투자의 시작</p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <button
              onClick={() => onNavigateTo('terms')}
              className="hover:text-white transition-colors"
            >
              서비스 약관
            </button>
            <button
              onClick={() => onNavigateTo('privacy')}
              className="hover:text-white transition-colors"
            >
              개인정보처리방침
            </button>
            <a href="#" className="hover:text-white transition-colors">
              고객지원
            </a>
            <a href="#" className="hover:text-white transition-colors">
              문의하기
            </a>
          </div>
          <div className="mt-6 text-sm text-gray-500">
            © 2025 감자증권 (PotatoInvest). All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

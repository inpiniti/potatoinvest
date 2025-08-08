import { motion } from 'motion/react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  BarChart3,
  Wallet,
  TrendingUp,
  Calendar,
  Monitor,
  Smartphone,
  Zap,
  Brain,
} from 'lucide-react';

export function AppPreview() {
  return (
    <section className="relative py-20 px-4 bg-gray-50 z-10">
      <div className="max-w-7xl mx-auto pt-44">
        <motion.div
          className="text-center mb-16 relative z-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            모든 디바이스에서 완벽한 경험
          </h2>
          <p className="text-xl text-muted-foreground">
            모바일과 데스크탑 모두에서 강력한 투자 도구를 만나보세요
          </p>
        </motion.div>

        <div className="relative z-10">
          <Tabs defaultValue="mobile" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="mobile" className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  모바일
                </TabsTrigger>
                <TabsTrigger
                  value="desktop"
                  className="flex items-center gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  데스크탑
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="mobile">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Mobile Mockup */}
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="mx-auto w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                    <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                      {/* Status Bar */}
                      <div className="bg-white px-6 py-3 flex justify-between items-center text-sm">
                        <span>9:41</span>
                        <div className="flex items-center space-x-1">
                          <div className="w-4 h-2 bg-gray-300 rounded-sm"></div>
                          <div className="w-6 h-2 bg-gray-300 rounded-sm"></div>
                          <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                        </div>
                      </div>

                      {/* Header */}
                      <div className="bg-white px-6 py-4 border-b">
                        <h1 className="font-semibold">감자증권</h1>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-3 bg-gray-50 h-full">
                        <div className="flex items-center justify-between">
                          <h2 className="text-lg font-medium">종목 분석</h2>
                          <span className="text-sm text-gray-500">
                            미국 시장
                          </span>
                        </div>

                        {/* Sample Stock Cards */}
                        <div className="space-y-3">
                          <Card className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">MSFT</span>
                                <Badge className="bg-red-100 text-red-800 text-xs">
                                  강력매수
                                </Badge>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">$513.24</div>
                                <div className="text-red-600 text-sm">
                                  +0.13%
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Microsoft Corporation
                            </div>
                            <div className="flex justify-between mt-2 text-xs">
                              <span>PER 37.6</span>
                              <span>ROE 33.3%</span>
                              <span className="text-red-600">
                                RSI 70 (과매수)
                              </span>
                            </div>
                            <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                              <div className="flex items-center gap-1 text-blue-600">
                                <Zap className="w-3 h-3" />
                                <span>
                                  부스트 추천: 2시간 내 3.2% 상승 예상
                                </span>
                              </div>
                            </div>
                          </Card>

                          <Card className="p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">AAPL</span>
                                <Badge className="bg-orange-100 text-orange-800 text-xs">
                                  매수
                                </Badge>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">$224.31</div>
                                <div className="text-blue-600 text-sm">
                                  -0.89%
                                </div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Apple Inc.
                            </div>
                            <div className="flex justify-between mt-2 text-xs">
                              <span>PER 28.5</span>
                              <span>ROE 56.8%</span>
                              <span className="text-gray-600">
                                RSI 45 (중립)
                              </span>
                            </div>
                            <div className="mt-2 p-2 bg-green-50 rounded text-xs">
                              <div className="flex items-center gap-1 text-green-600">
                                <Brain className="w-3 h-3" />
                                <span>
                                  AI 분석: 실적 발표 후 상승 가능성 73%
                                </span>
                              </div>
                            </div>
                          </Card>
                        </div>
                      </div>

                      {/* Bottom Navigation */}
                      <div className="absolute bottom-0 left-0 right-0 bg-white border-t px-4 py-2">
                        <div className="flex justify-around">
                          <div className="flex flex-col items-center text-primary">
                            <BarChart3 className="w-5 h-5 mb-1" />
                            <span className="text-xs">분석</span>
                          </div>
                          <div className="flex flex-col items-center text-gray-400">
                            <Wallet className="w-5 h-5 mb-1" />
                            <span className="text-xs">잔고</span>
                          </div>
                          <div className="flex flex-col items-center text-gray-400">
                            <TrendingUp className="w-5 h-5 mb-1" />
                            <span className="text-xs">체결</span>
                          </div>
                          <div className="flex flex-col items-center text-gray-400">
                            <Calendar className="w-5 h-5 mb-1" />
                            <span className="text-xs">기간손익</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Mobile Features */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="space-y-8"
                >
                  <div>
                    <h3 className="text-2xl font-semibold mb-4">
                      모바일 특화 기능
                    </h3>
                    <div className="space-y-6">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Zap className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">부스트 기능</h4>
                          <p className="text-gray-600">
                            AI가 분석한 초단기 투자 기회를 실시간으로 알림.
                            2-6시간 내 목표 수익률 달성 시 자동 매도로 빠른 수익
                            실현.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Brain className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            딥러닝 확률 예측
                          </h4>
                          <p className="text-gray-600">
                            과거 5년간 시장 데이터를 학습한 AI가 주가 변동
                            확률을 예측. 상승/하락 확률을 퍼센트로 제공하여 투자
                            결정 지원.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            실시간 뉴스 분석
                          </h4>
                          <p className="text-gray-600">
                            각 종목 관련 뉴스를 AI가 분석하여 긍정/부정 점수를
                            산출. 시장 센티먼트 변화를 실시간으로 모니터링.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">
                            재무제표 자동 분석
                          </h4>
                          <p className="text-gray-600">
                            분기별 실적 발표 시 자동으로 재무제표를 분석하여
                            성장성, 수익성, 안정성 지표를 쉽게 이해할 수 있도록
                            리포팅.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>

            <TabsContent value="desktop">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Desktop Mockup */}
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="lg:col-span-2"
                >
                  <div className="bg-gray-900 rounded-lg p-2 shadow-2xl">
                    <div className="bg-white rounded-lg overflow-hidden">
                      {/* Browser Header */}
                      <div className="bg-gray-100 px-4 py-3 flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        </div>
                        <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-500">
                          app.potatoinvest.com
                        </div>
                      </div>

                      {/* Desktop Content */}
                      <div className="h-96 flex">
                        {/* Sidebar */}
                        <div className="w-64 bg-gray-50 border-r p-4">
                          <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                              <BarChart3 className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <span className="font-semibold text-sm">
                                감자증권
                              </span>
                              <div className="text-xs text-gray-500">
                                PotatoInvest
                              </div>
                            </div>
                          </div>

                          <nav className="space-y-2">
                            <div className="flex items-center gap-3 px-3 py-2 bg-primary text-white rounded">
                              <BarChart3 className="w-4 h-4" />
                              <span className="text-sm">분석</span>
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded">
                              <Wallet className="w-4 h-4" />
                              <span className="text-sm">잔고</span>
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded">
                              <TrendingUp className="w-4 h-4" />
                              <span className="text-sm">체결</span>
                            </div>
                            <div className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded">
                              <Calendar className="w-4 h-4" />
                              <span className="text-sm">기간손익</span>
                            </div>
                          </nav>

                          {/* Boost Panel */}
                          <div className="mt-6 p-3 bg-blue-50 rounded border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Zap className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">
                                부스트 활성
                              </span>
                            </div>
                            <div className="text-xs text-blue-600">
                              3개 종목 모니터링 중
                            </div>
                            <Button size="sm" className="w-full mt-2 text-xs">
                              관리
                            </Button>
                          </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">
                              실시간 종목 분석
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>실시간 연결됨</span>
                            </div>
                          </div>

                          {/* Stock Grid */}
                          <div className="grid grid-cols-2 gap-4">
                            <Card className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">MSFT</span>
                                  <Badge className="bg-red-100 text-red-800 text-xs">
                                    강력매수
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold">$513.24</div>
                                  <div className="text-red-600 text-sm">
                                    +0.13%
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mb-2">
                                Microsoft Corporation
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span>PER 37.6</span>
                                  <span>ROE 33.3%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>상승확률</span>
                                  <span className="text-red-600 font-medium">
                                    78%
                                  </span>
                                </div>
                              </div>
                              <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                                <div className="flex items-center gap-1 text-blue-600">
                                  <Zap className="w-3 h-3" />
                                  <span>부스트: 2시간 내 매도 예정</span>
                                </div>
                              </div>
                            </Card>

                            <Card className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold">AAPL</span>
                                  <Badge className="bg-orange-100 text-orange-800 text-xs">
                                    매수
                                  </Badge>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold">$224.31</div>
                                  <div className="text-blue-600 text-sm">
                                    -0.89%
                                  </div>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mb-2">
                                Apple Inc.
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span>PER 28.5</span>
                                  <span>ROE 56.8%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>상승확률</span>
                                  <span className="text-green-600 font-medium">
                                    64%
                                  </span>
                                </div>
                              </div>
                              <div className="mt-3 p-2 bg-green-50 rounded text-xs">
                                <div className="flex items-center gap-1 text-green-600">
                                  <Brain className="w-3 h-3" />
                                  <span>뉴스 분석: 긍정적 (8.2/10)</span>
                                </div>
                              </div>
                            </Card>
                          </div>

                          {/* Bottom Panel */}
                          <div className="mt-4 p-3 bg-gray-50 rounded">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                AI 분석 업데이트
                              </span>
                              <span className="text-green-600">● 실시간</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Desktop Features */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      데스크탑 전용 기능
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Monitor className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">멀티 모니터 지원</h4>
                          <p className="text-sm text-gray-600">
                            여러 화면에서 동시에 다양한 차트와 데이터 모니터링
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <BarChart3 className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">고급 차트 분석</h4>
                          <p className="text-sm text-gray-600">
                            복잡한 기술적 분석 도구와 커스텀 지표 설정
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Zap className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">부스트 대시보드</h4>
                          <p className="text-sm text-gray-600">
                            실시간 부스트 종목 모니터링과 자동 매도 설정
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Brain className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">AI 리포트 생성</h4>
                          <p className="text-sm text-gray-600">
                            포트폴리오별 상세 분석 리포트 자동 생성 및 다운로드
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}

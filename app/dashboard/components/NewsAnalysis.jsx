import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Brain,
  Newspaper,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Search,
  Globe,
  ExternalLink,
  Info,
  Sparkles,
  Activity,
  BarChart3,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import useGeminiNews from "../hooks/useGeminiNews";

const analysisSteps = [
  {
    step: 1,
    message: "Yahoo Finance 뉴스 수집 중...",
    icon: Globe,
    color: "#7c3aed",
  },
  {
    step: 2,
    message: "Seeking Alpha 분석 중...",
    icon: Search,
    color: "#2563eb",
  },
  {
    step: 3,
    message: "CNBC 데이터 크롤링 중...",
    icon: Activity,
    color: "#dc2626",
  },
  {
    step: 4,
    message: "MarketWatch 뉴스 분석 중...",
    icon: Newspaper,
    color: "#059669",
  },
  {
    step: 5,
    message: "Bloomberg 데이터 처리 중...",
    icon: BarChart3,
    color: "#ea580c",
  },
  {
    step: 6,
    message: "Reuters 뉴스 감성 분석 중...",
    icon: Brain,
    color: "#7c2d12",
  },
  {
    step: 7,
    message: "Financial Times 기사 평가 중...",
    icon: TrendingUp,
    color: "#be123c",
  },
  {
    step: 8,
    message: "종합 분석 및 점수 산출 중...",
    icon: Sparkles,
    color: "#a21caf",
  },
];

const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case "긍정":
      return "#10b981";
    case "부정적":
      return "#ef4444";
    case "중립":
      return "#6b7280";
    default:
      return "#6b7280"; // 기본값 추가
  }
};

const getSentimentIcon = (sentiment) => {
  switch (sentiment) {
    case "긍정":
      return TrendingUp;
    case "부정적":
      return TrendingDown;
    case "중립":
      return CheckCircle;
    default:
      return CheckCircle; // 기본값 추가
  }
};

const getReliabilityColor = (reliability) => {
  switch (reliability) {
    case "높음":
      return "bg-green-100 text-green-800";
    case "중간":
      return "bg-yellow-100 text-yellow-800";
    case "낮음":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800"; // 기본값 추가
  }
};

const TypewriterText = ({ text, speed = 50 }) => {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef(null);

  // text가 변경되면 즉시 초기화하고 이전 타이머 정리
  useEffect(() => {
    // 이전 타이머가 있다면 정리
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  // 타이핑 애니메이션 효과
  useEffect(() => {
    // 이전 타이머 정리
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (currentIndex < text.length) {
      timerRef.current = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
    }

    // cleanup 함수
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [currentIndex, text.length]); // speed 의존성 제거

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return <span>{displayText}</span>;
};

export function NewsAnalysis({ ticker }) {
  const {
    data: geminiNewsData,
    mutate: fetchGeminiNewsData,
    isPending: geminiNewsPending,
    error,
    reset: resetGeminiNews, // reset 함수 추가
  } = useGeminiNews(); // 뉴스 데이터

  const [currentStep, setCurrentStep] = useState(0);

  // ticker가 변경되면 상태 초기화
  useEffect(() => {
    setCurrentStep(0);
    resetGeminiNews(); // fetch된 데이터도 초기화
  }, [ticker, resetGeminiNews]);
  const startAnalysis = async () => {
    setCurrentStep(0);

    // 이전 데이터 초기화
    resetGeminiNews();

    // 단계별 진행을 위한 함수
    const progressSteps = () => {
      return new Promise((resolve) => {
        let step = 0;
        const stepInterval = setInterval(() => {
          setCurrentStep(step);
          step++;

          if (step >= analysisSteps.length) {
            clearInterval(stepInterval);
            resolve();
          }
        }, 5000); // 5초마다 단계 진행
      });
    };

    try {
      // 단계 진행과 API 호출을 병렬로 실행
      const [, apiResult] = await Promise.all([
        progressSteps(),
        fetchGeminiNewsData({
          code: ticker,
        }),
      ]);

      // 완료 후 마지막 단계로 설정
      setCurrentStep(analysisSteps.length - 1);
    } catch (error) {
      console.error("분석 중 오류:", error);
      setCurrentStep(0);
    }
  };

  const getSentimentChartData = () => {
    if (!geminiNewsData?.newsAnalysis) return [];

    const sentimentCounts = geminiNewsData.newsAnalysis.reduce(
      (acc, article) => {
        if (article?.sentiment) {
          acc[article.sentiment] = (acc[article.sentiment] || 0) + 1;
        }
        return acc;
      },
      {}
    );

    return Object.entries(sentimentCounts).map(([sentiment, count]) => ({
      name: sentiment,
      value: count,
      fill: getSentimentColor(sentiment),
    }));
  };

  // 초기 상태: AI 분석 버튼만 표시
  if (!geminiNewsPending && !geminiNewsData) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg border">
              <Newspaper className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI 뉴스 감성 분석
              </h1>
            </div>
            <p className="text-gray-600 text-lg">
              {ticker} 종목의 최근 뉴스를 AI로 분석하여 시장 감성을 파악합니다
            </p>
          </div>

          <Card className="max-w-md mx-auto">
            <CardContent className="pt-8 pb-6">
              <div className="text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">AI 분석 준비 완료</h3>
                  <p className="text-gray-600 text-sm">
                    {ticker} 종목의 뉴스 데이터를 수집하고
                    <br />
                    감성 분석을 시작할 준비가 되었습니다
                  </p>
                </div>
                <Button
                  onClick={startAnalysis}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  AI 뉴스 분석 시작
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 로딩 상태
  if (geminiNewsPending) {
    const currentStepData = analysisSteps[currentStep] || analysisSteps[0];
    const IconComponent = currentStepData.icon;

    return (
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg">
            <Brain className="w-6 h-6" />
            <h1 className="text-3xl font-bold">AI 뉴스 분석 진행 중</h1>
          </div>
          <p className="text-gray-600 text-lg">
            {ticker} 종목의 뉴스 데이터를 실시간으로 분석하고 있습니다
          </p>
        </div>

        {/* Progress Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-8 pb-6">
            <div className="space-y-6">
              {/* Current Step Display */}
              <div className="text-center">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white relative overflow-hidden"
                    style={{ backgroundColor: currentStepData.color }}
                  >
                    <IconComponent className="w-8 h-8" />
                    <motion.div
                      className="absolute inset-0 bg-white opacity-30"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <div className="text-lg font-semibold">
                    <TypewriterText text={currentStepData.message} speed={80} />
                  </div>
                </motion.div>
              </div>

              {/* Progress Steps */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {analysisSteps.slice(0, 8).map((step, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border transition-all ${
                      index <= currentStep
                        ? "border-blue-200 bg-blue-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                          index <= currentStep
                            ? "bg-blue-500 text-white"
                            : "bg-gray-300 text-gray-600"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs font-medium text-gray-700">
                        {step.message.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${
                      ((currentStep + 1) / analysisSteps.length) * 100
                    }%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-4/6" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
        <div className="text-center mt-6">
          <Button variant="outline">다시 시도</Button>
        </div>
      </div>
    );
  }

  // 결과 표시
  if (geminiNewsData) {
    const sentimentChartData = getSentimentChartData();

    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg border">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              뉴스 감성 분석 완료
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {geminiNewsData.companyName} ({geminiNewsData.ticker}) -{" "}
            {geminiNewsData.analysisperiod}
          </p>
        </div>

        {/* Overall Sentiment Alert */}
        <Alert className="border-green-200 bg-green-50">
          <TrendingUp className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>
              종합 감성 점수: {geminiNewsData.overallSentiment?.score}/5.0 (
              {geminiNewsData.overallSentiment?.rating})
            </strong>
            <br />
            {geminiNewsData.overallSentiment?.summary_kr}
          </AlertDescription>
        </Alert>

        {/* Main Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sentiment Score */}
          <Card>
            <CardHeader className="text-center">
              <CardTitle>감성 점수</CardTitle>
              <p className="text-sm text-muted-foreground">
                종합 뉴스 감성 평가
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        {
                          value:
                            (geminiNewsData.overallSentiment?.score / 5) * 100,
                        },
                        {
                          value:
                            100 -
                            (geminiNewsData.overallSentiment?.score / 5) * 100,
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      cornerRadius={8}
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#f3f4f6" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {geminiNewsData.overallSentiment?.score.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-500">/ 5.0</div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <Badge variant="default" className="px-4 py-1">
                  {geminiNewsData.overallSentiment?.rating}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>감성 분포</CardTitle>
              <p className="text-sm text-muted-foreground">
                뉴스별 감성 분류 현황
              </p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sentimentChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    cornerRadius={4}
                  >
                    {sentimentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-2 mt-4">
                {sentimentChartData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.fill }}
                    />
                    <span className="text-xs text-gray-600">
                      {item.name} ({item.value})
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Coverage */}
          <Card>
            <CardHeader>
              <CardTitle>데이터 커버리지</CardTitle>
              <p className="text-sm text-muted-foreground">뉴스 수집 현황</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {geminiNewsData.dataAvailability.newsCount}
                </div>
                <div className="text-sm text-gray-500">개 뉴스 분석</div>
              </div>
              <div className="space-y-2">
                <Badge
                  variant={
                    geminiNewsData.dataAvailability.coverage === "양호"
                      ? "default"
                      : "secondary"
                  }
                  className="w-full justify-center"
                >
                  커버리지: {geminiNewsData.dataAvailability.coverage}
                </Badge>
                <div className="text-xs text-gray-600 text-center">
                  {geminiNewsData.dataAvailability.sourcesWithData.length}개
                  소스에서 수집
                </div>
              </div>
              <div className="space-y-1">
                {geminiNewsData.dataAvailability.sourcesWithData.map(
                  (source, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs"
                    >
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{source}</span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Factors */}
        {geminiNewsData.overallSentiment?.keyFactors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>주요 요인</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {geminiNewsData.overallSentiment?.keyFactors.map(
                  (factor, index) => (
                    <Badge key={index} variant="outline" className="px-3 py-1">
                      {factor}
                    </Badge>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* News Articles */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            개별 뉴스 분석
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {geminiNewsData?.newsAnalysis?.map((article, index) => {
              if (!article) return null; // null 체크 추가

              const SentimentIcon = getSentimentIcon(article.sentiment);

              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm line-clamp-2">
                        {article.title || "제목 없음"}
                      </CardTitle>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <SentimentIcon
                          className="w-4 h-4"
                          style={{
                            color: getSentimentColor(article.sentiment),
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{article.source || "출처 없음"}</span>
                      <span>{article.publishDate || "날짜 없음"}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        style={{
                          backgroundColor: `${getSentimentColor(
                            article.sentiment
                          )}20`,
                          color: getSentimentColor(article.sentiment),
                        }}
                        className="text-xs"
                      >
                        {article.sentiment || "알 수 없음"}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getReliabilityColor(
                          article.reliability
                        )}`}
                      >
                        신뢰도 {article.reliability || "알 수 없음"}
                      </Badge>
                    </div>

                    <div className="bg-gray-50 p-2 rounded-lg">
                      <p className="text-xs text-gray-700 line-clamp-3">
                        {article.reasoning || "분석 내용이 없습니다."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {article.keywords?.slice(0, 3).map((keyword, i) => (
                        <span
                          key={i}
                          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => window.open(article.url, "_blank")}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      원문 보기
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Button
            onClick={() => {
              // 새로운 분석을 위해 데이터 초기화
              setCurrentStep(0);
              resetGeminiNews(); // mutation 데이터 초기화
            }}
            variant="outline"
            size="lg"
            className="mr-4"
          >
            새로운 분석
          </Button>
        </div>

        {/* Disclaimer */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-900">
                  뉴스 분석 주의사항
                </p>
                <p className="text-sm text-amber-700">
                  본 분석은 AI를 통한 뉴스 텍스트 감성 분석 결과이며, 실제 투자
                  의사결정의 근거로만 사용되어서는 안 됩니다. 뉴스의 맥락과 시장
                  상황을 종합적으로 고려하여 판단하시기 바랍니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}

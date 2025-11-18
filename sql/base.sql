-- Base 데이터 저장용 테이블 (Dataroma 크롤링 결과)
-- 단일 로우만 허용 (최신 크롤링 결과 저장)

CREATE TABLE IF NOT EXISTS base (
  id INTEGER PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row_only CHECK (id = 1)
);

-- 인덱스: updated_at으로 최신 여부 확인
CREATE INDEX IF NOT EXISTS idx_base_updated_at ON base(updated_at DESC);

-- RLS (Row Level Security) 비활성화 - API에서만 접근
ALTER TABLE base DISABLE ROW LEVEL SECURITY;

-- 초기 더미 데이터 삽입 (선택사항)
-- INSERT INTO base (id, data) 
-- VALUES (1, '{"based_on_person": [], "based_on_stock": [], "meta": {}}')
-- ON CONFLICT (id) DO NOTHING;

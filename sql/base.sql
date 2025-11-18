-- Base 데이터 저장용 테이블 (Dataroma 크롤링 결과 + Hello API 결과)
-- 2개 로우만 허용: id=1 (dataroma), id=2 (hello)

CREATE TABLE IF NOT EXISTS base (
  id INTEGER PRIMARY KEY,
  json JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT two_rows_only CHECK (id IN (1, 2))
);

-- RLS (Row Level Security) 비활성화 - API에서만 접근
ALTER TABLE base DISABLE ROW LEVEL SECURITY;

-- 초기 더미 데이터 삽입 (선택사항)
-- INSERT INTO base (id, json) 
-- VALUES 
--   (1, '{"based_on_person": [], "based_on_stock": [], "meta": {}}'),
--   (2, '[]')
-- ON CONFLICT (id) DO NOTHING;

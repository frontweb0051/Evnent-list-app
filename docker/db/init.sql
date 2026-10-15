CREATE TABLE users (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE events (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title             VARCHAR(255) NOT NULL,
    description       TEXT         NOT NULL DEFAULT '',
    address           VARCHAR(255) NOT NULL,
    venue_name        VARCHAR(255) NOT NULL,
    estimated_time    VARCHAR(255) NOT NULL,
    participation_fee INT          NOT NULL,
    event_date        DATE         NOT NULL,
    start_time        TIME         NOT NULL,
    end_time          TIME         NOT NULL,
    capacity          INT          NOT NULL CHECK (capacity > 0),
    remaining         INT          NOT NULL,
    status            VARCHAR(20)  NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'closed')),
    precautions       VARCHAR(255) NOT NULL,
    belongings        VARCHAR(255) NOT NULL,
    created_by        BIGINT       REFERENCES users (id),
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE participants (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    event_id     BIGINT       NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    name         VARCHAR(100) NOT NULL,
    email        VARCHAR(255) NOT NULL,
    guests       INT          NOT NULL CHECK (guests >= 1),
    note         TEXT,
    cancel_token CHAR(64)     NOT NULL UNIQUE,
    status       VARCHAR(20)  NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    user_id      BIGINT       REFERENCES users (id),
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

INSERT INTO events
    (title, description, address, venue_name, estimated_time, participation_fee,
    event_date, start_time, end_time, capacity, remaining, status, precautions, belongings)
VALUES
(
    'Reactもくもく会 vol.12',
    E'React・TypeScript・Vite・Next.js など、フロントエンド技術を各自で進める静かな作業会です。\n「一人では進まない」「集中できる環境で作業したい」という方を歓迎します。進捗のシェアタイムを17:00前に設けます。手を動かしたことを話すだけでOKです。 参加者のスキルレベルは問いません。はじめての方も気軽にどうぞ。',
    '東京都渋谷区道玄坂1-2-3',
    '渋谷コワーキングスペース 401号室',
    '3時間',
    0,
    '2026-10-15', '14:00', '17:00',
    10, 3, 'published',
    '申込完了後、キャンセルが必要な場合はお問い合わせページからご連絡ください。定員を超えた場合のキャンセル待ち機能は現在準備中です。',
    'ノートPC（充電ケーブルも）、やりたいこと・課題。 Wi-Fiあり、電源席あり。飲食物の持ち込みOK。'
),
(
    'PHP入門ハンズオン',
    E'PHPでWebアプリを作るための基礎を、手を動かしながら学ぶハンズオンです。\nPDOを使ったデータベース接続、フォームの処理、簡単なAPIの作り方までを扱います。\nプログラミング経験が少ない方も歓迎です。',
    'オンライン(Zoom)',
    'Zoomミーティング',
    '2時間',
    0,
    '2026-10-10', '10:00', '12:00',
    20, 12, 'published',
    E'Zoomの接続URLは、申込完了後にご案内します。\n開始10分前から入室できます。',
    'PCとインターネット環境。PHP 8.x が動く環境があると、スムーズに進められます。'
),
(
    'TypeScript勉強会 vol.5',
    E'TypeScriptの型の使い方を、実際のコードを見ながら学ぶ勉強会です。\n前半は型の基礎と実践パターンの解説、後半は参加者のコードをみんなで読み合う時間にします。',
    '東京都港区六本木3-4-5',
    '六本木ビジネスラウンジ 5階',
    '3時間',
    1000,
    '2026-10-17', '13:00', '16:00',
    15, 0, 'published',
    '定員に達したため、現在は新規の申込を受け付けていません。',
    'ノートPC、普段書いているTypeScriptのコード(任意)。参加費は当日、会場でお支払いください。'
),
(
    'Next.js入門ハンズオン',
    E'Next.jsのApp Routerを使って、簡単なブログサイトを作ります。\nルーティング、データ取得、デプロイまでの流れを2時間で体験します。\nReactの基本(コンポーネント、props、state)に触れたことがある方が対象です。',
    '東京都新宿区西新宿2-1-1',
    '新宿オフィスセミナールームA',
    '2時間',
    500,
    '2026-10-22', '19:00', '21:00',
    30, 18, 'published',
    '平日夜の開催です。開始後に入室された場合は、途中からの参加になります。',
    'Node.js(v20以上)をインストールしたノートPC、電源ケーブル。'
),
(
    'フロントエンドLT会',
    E'フロントエンドに関する5分間のライトニングトークを、みんなで楽しむ会です。\n発表者は当日の飛び入りも歓迎です。聞くだけの参加もOKです。\n終了後に、同じ会場で懇親会(軽食・ドリンク付き)を行います。',
    '大阪府大阪市北区梅田1-2-3',
    '梅田コミュニティスペース 3階',
    '2時間',
    2000,
    '2026-10-28', '19:30', '21:30',
    25, 5, 'published',
    E'参加費には、軽食とドリンク代が含まれます。\nアルコールの提供はありません。',
    '特にありません。発表したい方は、スライドを入れたPCをお持ちください。'
),
(
    'PostgreSQL入門もくもく会',
    E'PostgreSQLのインストールから、テーブル設計、基本的なSQLまでを、各自のペースで進めるもくもく会です。\nわからないところは、その場で質問できます。\nDockerでの環境構築に挑戦したい方も歓迎です。',
    '愛知県名古屋市中村区名駅1-1-1',
    '名駅ワークラウンジ 7階',
    '3時間',
    0,
    '2026-11-07', '10:00', '13:00',
    12, 12, 'published',
    E'途中参加・途中退出もOKです。\n会場への持ち込みは、飲み物のみ可能です。',
    'ノートPC、充電ケーブル。事前にDocker Desktopを入れておくと、スムーズです。'
),
(
    'Web制作ポートフォリオ相談会',
    E'Web制作のポートフォリオを、現役のエンジニアやデザイナーに見てもらえる相談会です。\n1人20分程度、サイトの構成や見せ方についてフィードバックをもらえます。\nこれから転職・フリーランスを目指す方に向いています。',
    '福岡県福岡市博多区博多駅前2-3-4',
    '博多駅前コワーキング 会議室B',
    '3時間',
    1500,
    '2026-11-14', '14:00', '17:00',
    8, 1, 'published',
    E'相談枠の関係で、定員を少なめにしています。\n見てもらいたいサイトのURLを、備考欄に書いていただけると助かります。',
    '見てもらいたいポートフォリオ(PCやスマートフォンで見せられる状態にしてください)。'
);
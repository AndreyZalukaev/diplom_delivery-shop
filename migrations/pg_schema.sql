-- ============================================================
-- Схема базы данных "Северяночка" (severianochka)
-- PostgreSQL 16
-- ============================================================

-- ============================================================
-- 1. ПОЛЬЗОВАТЕЛИ
-- ============================================================
CREATE TABLE public.users (
    id integer NOT NULL,                              -- ID пользователя
    email text,                                       -- Email (может быть NULL)
    password_hash text,                               -- Хеш пароля (bcrypt)
    name text,                                        -- Имя пользователя
    birth_date date,                                  -- Дата рождения
    phone text,                                       -- Телефон в формате +7XXXXXXXXXX
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    region character varying(255),                    -- Регион (не используется)
    location character varying(255),                  -- Город
    gender character varying(50),                     -- Пол (male/female)
    loyalty_card character varying(50),               -- Номер карты лояльности
    email_verified boolean DEFAULT false,             -- Email подтверждён
    phone_verified boolean DEFAULT false,             -- Телефон подтверждён
    avatar text,                                      -- URL аватара
    has_card boolean DEFAULT false,                   -- Есть карта лояльности
    role character varying(50) DEFAULT 'user'::character varying,  -- Роль: user/admin/manager
    favorites bigint[] DEFAULT '{}'::integer[],       -- Избранные товары (массив ID)
    cart jsonb DEFAULT '[]'::jsonb,                   -- Корзина (JSON)
    bonuses_count integer DEFAULT 0,                  -- Количество бонусов
    purchases integer[] DEFAULT ARRAY[]::integer[]    -- Купленные товары (массив ID)
);

ALTER TABLE ONLY public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
CREATE INDEX idx_users_cart ON public.users USING gin (cart);
CREATE INDEX idx_users_favorites ON public.users USING gin (favorites);
CREATE SEQUENCE public.users_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


-- ============================================================
-- 2. ТОВАРЫ
-- ============================================================
CREATE TABLE public.products (
    id bigint NOT NULL,                               -- ID товара
    img text NOT NULL,                                -- URL изображения
    name text NOT NULL,                               -- Название
    description text,                                 -- Описание
    base_price integer NOT NULL,                      -- Базовая цена (в копейках/рублях)
    discount_percent integer DEFAULT 0,               -- Скидка в %
    rating_rate numeric(3,1) DEFAULT 0,               -- Рейтинг (0-5)
    rating_count integer DEFAULT 0,                   -- Количество оценок
    tags text[] DEFAULT '{}'::text[],                 -- Категории (массив), например {tea, coffee}
    weight text,                                      -- Вес/объём
    quantity integer DEFAULT 0,                       -- Остаток на складе
    is_our_production boolean DEFAULT false,          -- Собственное производство
    is_healthy_food boolean DEFAULT false,            -- Здоровое питание
    is_non_gmo boolean DEFAULT false,                 -- Без ГМО
    article character varying(10),                    -- Артикул
    manufacturer character varying(255),              -- Производитель
    brand character varying(255),                     -- Бренд
    rating_distribution jsonb DEFAULT '{"1":0,"2":0,"3":0,"4":0,"5":0}'::jsonb,  -- Распределение оценок
    country character varying(100)                    -- Страна производства
);

ALTER TABLE ONLY public.products ADD CONSTRAINT products_pkey PRIMARY KEY (id);
CREATE SEQUENCE public.products_id_seq START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;
ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


-- ============================================================
-- 3. ЗАКАЗЫ
-- ============================================================
CREATE TABLE public.orders (
    id integer NOT NULL,                              -- ID заказа
    user_id integer,                                  -- ID пользователя
    order_number text,                                -- Номер заказа (строка)
    status text DEFAULT 'pending'::text,              -- Статус: pending/confirmed/delivered/cancelled
    payment_method text,                              -- Способ оплаты
    payment_status text DEFAULT 'pending'::text,      -- Статус оплаты
    total_amount numeric(10,2),                       -- Итоговая сумма
    discount_amount numeric(10,2),                    -- Скидка
    used_bonuses integer DEFAULT 0,                   -- Использовано бонусов
    earned_bonuses integer DEFAULT 0,                 -- Начислено бонусов
    delivery_address jsonb,                           -- Адрес доставки (JSON)
    delivery_date text,                               -- Дата доставки
    delivery_time_slot text,                          -- Временной слот
    surname text,                                     -- Фамилия получателя
    name text,                                        -- Имя получателя
    phone text,                                       -- Телефон получателя
    gender text,                                      -- Пол получателя
    birthday text,                                    -- Дата рождения получателя
    items jsonb,                                      -- Товары в заказе (JSON)
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

ALTER TABLE ONLY public.orders ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
CREATE SEQUENCE public.orders_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;
ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


-- ============================================================
-- 4. КАРТЫ ЛОЯЛЬНОСТИ
-- ============================================================
CREATE TABLE public.cards (
    id integer NOT NULL,                              -- ID записи
    card_number character varying(19) NOT NULL,       -- Номер карты (16 цифр с пробелами)
    order_number integer DEFAULT 0,                   -- Номер заказа (зарезервировано)
    is_active boolean DEFAULT false,                  -- Активна ли карта
    created_at timestamp without time zone DEFAULT now(),
    activated_at timestamp without time zone,         -- Дата активации
    deactivated_at timestamp without time zone,       -- Дата деактивации
    user_id integer                                   -- ID владельца
);

ALTER TABLE ONLY public.cards ADD CONSTRAINT cards_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.cards ADD CONSTRAINT cards_card_number_key UNIQUE (card_number);
ALTER TABLE ONLY public.cards ADD CONSTRAINT cards_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);
CREATE INDEX idx_cards_number ON public.cards USING btree (card_number);
CREATE INDEX idx_cards_user ON public.cards USING btree (user_id);
CREATE SEQUENCE public.cards_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE public.cards_id_seq OWNED BY public.cards.id;
ALTER TABLE ONLY public.cards ALTER COLUMN id SET DEFAULT nextval('public.cards_id_seq'::regclass);


-- ============================================================
-- 5. СТАТЬИ
-- ============================================================
CREATE TABLE public.articles (
    id integer NOT NULL,                              -- ID статьи
    img text NOT NULL,                                -- URL изображения
    title text NOT NULL,                              -- Заголовок
    text text NOT NULL,                               -- Текст статьи
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE ONLY public.articles ADD CONSTRAINT articles_pkey PRIMARY KEY (id);
CREATE SEQUENCE public.articles_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;
ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


-- ============================================================
-- 6. ОТЗЫВЫ
-- ============================================================
CREATE TABLE public.reviews (
    id integer NOT NULL,                              -- ID отзыва
    product_id bigint NOT NULL,                       -- ID товара
    user_id bigint NOT NULL,                          -- ID пользователя
    user_name character varying(255) NOT NULL,        -- Имя пользователя
    rating integer NOT NULL,                          -- Оценка (1-5)
    comment text NOT NULL,                            -- Текст отзыва
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);

ALTER TABLE ONLY public.reviews ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.reviews ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.reviews ADD CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
CREATE INDEX idx_reviews_product_id ON public.reviews USING btree (product_id);
CREATE INDEX idx_reviews_user_id ON public.reviews USING btree (user_id);
CREATE SEQUENCE public.reviews_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE public.reviews_id_seq OWNED BY public.reviews.id;
ALTER TABLE ONLY public.reviews ALTER COLUMN id SET DEFAULT nextval('public.reviews_id_seq'::regclass);


-- ============================================================
-- 7. ПОКУПКИ (связь пользователь-товар)
-- ============================================================
CREATE TABLE public.purchases (
    id integer NOT NULL,                              -- ID записи
    user_id bigint,                                   -- ID пользователя
    product_id bigint,                                -- ID товара
    quantity integer NOT NULL,                        -- Количество
    total_price integer NOT NULL,                     -- Общая цена
    purchase_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE ONLY public.purchases ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.purchases ADD CONSTRAINT purchases_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.purchases ADD CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
CREATE SEQUENCE public.purchases_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;
ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


-- ============================================================
-- 8. СЛОТЫ ДОСТАВКИ
-- ============================================================
CREATE TABLE public.delivery_slots (
    id integer NOT NULL,                              -- ID записи
    schedule jsonb DEFAULT '{}'::jsonb,               -- Расписание (JSON)
    updated_at timestamp without time zone DEFAULT now()
);

ALTER TABLE ONLY public.delivery_slots ADD CONSTRAINT delivery_slots_pkey PRIMARY KEY (id);
CREATE SEQUENCE public.delivery_slots_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE public.delivery_slots_id_seq OWNED BY public.delivery_slots.id;
ALTER TABLE ONLY public.delivery_slots ALTER COLUMN id SET DEFAULT nextval('public.delivery_slots_id_seq'::regclass);


-- ============================================================
-- 9. КАТАЛОГ (категории для главной страницы)
-- ============================================================
CREATE TABLE public.catalog (
    id integer NOT NULL,                              -- ID категории
    order_num integer NOT NULL,                       -- Порядок отображения
    title character varying(255) NOT NULL,            -- Название категории
    slug character varying(255) NOT NULL,             -- URL-slug
    img character varying(255) NOT NULL,              -- URL изображения
    col_span character varying(100) DEFAULT ''::character varying,       -- Размер в колонках (десктоп)
    tablet_col_span character varying(100) DEFAULT ''::character varying, -- Размер в колонках (планшет)
    mobile_col_span character varying(100) DEFAULT ''::character varying  -- Размер в колонках (мобильный)
);

ALTER TABLE ONLY public.catalog ADD CONSTRAINT catalog_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.catalog ADD CONSTRAINT catalog_slug_key UNIQUE (slug);
CREATE SEQUENCE public.catalog_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE public.catalog_id_seq OWNED BY public.catalog.id;
ALTER TABLE ONLY public.catalog ALTER COLUMN id SET DEFAULT nextval('public.catalog_id_seq'::regclass);


-- ============================================================
-- 10. ТОКЕНЫ ВЕРИФИКАЦИИ
-- ============================================================
CREATE TABLE public.verification_tokens (
    id integer NOT NULL,                              -- ID токена
    user_id integer NOT NULL,                         -- ID пользователя
    token text NOT NULL,                              -- Токен
    type text NOT NULL,                               -- Тип: email/phone
    expires_at timestamp without time zone NOT NULL,  -- Срок действия
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    verified boolean DEFAULT false                    -- Использован ли
);

ALTER TABLE ONLY public.verification_tokens ADD CONSTRAINT verification_tokens_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.verification_tokens ADD CONSTRAINT verification_tokens_token_key UNIQUE (token);
ALTER TABLE ONLY public.verification_tokens ADD CONSTRAINT verification_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
CREATE SEQUENCE public.verification_tokens_id_seq AS integer START WITH 1 INCREMENT BY 1;
ALTER SEQUENCE public.verification_tokens_id_seq OWNED BY public.verification_tokens.id;
ALTER TABLE ONLY public.verification_tokens ALTER COLUMN id SET DEFAULT nextval('public.verification_tokens_id_seq'::regclass);

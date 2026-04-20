import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Globe, ChevronRight, Heart, MessageCircle, Bookmark, ArrowLeft, Send, Flame, X, Clock, TrendingUp, User, Settings, LogOut, Edit3, Grid3X3, Home, Users, Camera, Bell as BellIcon, Shield, Eye, ChevronDown, Trash2, Moon, Smartphone, Bot, Sparkles, Share2, RefreshCw, Play, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type Lang = 'ko' | 'en' | 'ja' | 'vi';
type Tab = 'home' | 'community' | 'profile';
type ProfileSubTab = 'bookmarks' | 'activity';
type Overlay = 'search' | 'notifications' | 'editProfile' | 'settings' | 'kbot' | null;
type Article = {
  id: string;
  category: string;
  categoryKey: string;
  categoryColor: string;
  categoryBg: string;
  title: Record<Lang, string>;
  body: Record<Lang, string[]>;
  source: Record<Lang, string>;
  timeAgo: Record<Lang, string>;
  image: string;
  likes: number;
  comments: number;
  isFeatured?: boolean;
};
type CommunityThread = {
  id: string;
  articleId: string;
  topicTitle: Record<Lang, string>;
  topicSummary: Record<Lang, string>;
  category: string;
  categoryColor: string;
  commentCount: number;
  likeCount: number;
  hotScore: number;
  accentFrom: string;
  accentTo: string;
  image: string;
  comments: ThreadComment[];
};
type ThreadComment = {
  id: string;
  user: string;
  avatar: string;
  country: string;
  text: Record<Lang, string>;
  timeAgo: string;
  likes: number;
  replies?: ReplyComment[];
};
type ReplyComment = {
  id: string;
  user: string;
  avatar: string;
  country: string;
  text: Record<Lang, string>;
  timeAgo: string;
  likes: number;
};
type NotificationItem = {
  id: string;
  type: 'like' | 'comment' | 'trending';
  avatar: string;
  message: Record<Lang, string>;
  timeAgo: string;
  isRead: boolean;
};
type ActivityItem = {
  id: string;
  type: 'comment' | 'like';
  articleId: string;
  articleTitle: Record<Lang, string>;
  articleImage: string;
  articleCategory: string;
  articleCategoryColor: string;
  commentText: Record<Lang, string>;
  timeAgo: string;
  likeCount: number;
};
type ProfileData = {
  name: string;
  handle: string;
  bio: string;
  country: string;
  avatar?: string;
};
type SettingsState = {
  pushNotifications: boolean;
  commentAlerts: boolean;
  trendingAlerts: boolean;
  darkMode: boolean;
  privateAccount: boolean;
  showActivity: boolean;
};
type KBotMessage = {
  id: string;
  role: 'bot' | 'user';
  text: string;
};
type ArticleComment = {
  id: string;
  user: string;
  avatar: string;
  country: string;
  text: Record<Lang, string>;
  timeAgo: string;
  likes: number;
  replies?: ReplyComment[];
};

// --- i18n ---
type I18nMap = Record<Lang, Record<string, string>>;
const I18N: I18nMap = {
  ko: {
    appName: 'K·WAVE',
    tabHome: '홈',
    tabCommunity: '커뮤니티',
    tabProfile: '내 프로필',
    langLabel: '언어',
    readMore: '더 보기',
    trendingNow: '지금 핫한 주제',
    joinDiscussion: '토론 참여하기',
    addComment: '의견을 남겨보세요...',
    post: '게시',
    back: '뒤로',
    hotBadge: '핫',
    likeBadge: '좋아요',
    commentBadge: '댓글',
    featuredLabel: '주목 기사',
    searchPlaceholder: '검색어를 입력하세요🙂',
    recentSearches: '최근 검색',
    trendingSearches: '인기 검색어',
    notifications: '알림',
    allRead: '모두 읽음',
    noResults: '검색 결과가 없어요',
    bookmarks: '북마크',
    activity: '활동',
    myBookmarks: '내가 저장한 콘텐츠',
    myActivity: '내 활동',
    noBookmarks: '아직 저장된 콘텐츠가 없어요',
    noActivity: '아직 활동 내역이 없어요',
    bookmarkHint: '기사에 북마크를 눌러 저장해보세요',
    followers: '팔로워',
    following: '팔로잉',
    posts: '게시물',
    editProfile: '프로필 편집',
    settings: '설정',
    logout: '로그아웃',
    myComment: '내 댓글',
    onArticle: '에 남긴 댓글',
    liked: '좋아요 누름',
    save: '저장',
    cancel: '취소',
    name: '이름',
    handle: '핸들',
    bio: '소개',
    country: '국가',
    changePhoto: '이미지 변경',
    editProfileTitle: '프로필 편집',
    settingsTitle: '설정',
    notificationSettings: '알림 설정',
    pushNotifications: '푸시 알림',
    pushNotificationsDesc: '새 알림을 받을 때 푸시 알림 허용',
    commentAlerts: '댓글 알림',
    commentAlertsDesc: '내 게시물에 댓글이 달릴 때 알림',
    trendingAlerts: '트렌딩 알림',
    trendingAlertsDesc: '관심 주제가 핫해질 때 알림',
    displaySettings: '화면 설정',
    darkMode: '다크 모드',
    darkModeDesc: '어두운 테마 사용 (준비 중)',
    privacySettings: '개인정보 설정',
    privateAccount: '비공개 계정',
    privateAccountDesc: '팔로워만 내 활동을 볼 수 있어요',
    showActivity: '활동 공개',
    showActivityDesc: '내 좋아요 및 댓글 활동 공개',
    accountSettings: '계정 설정',
    deleteAccount: '계정 삭제',
    deleteAccountDesc: '계정과 모든 데이터를 삭제합니다',
    appVersion: '앱 버전',
    helpCenter: '도움말',
    kbot: 'K봇에게 물어보기',
    kbotTitle: 'K봇',
    kbotSubtitle: 'K-컬처 AI 도우미',
    kbotWelcome: '안녕하세요! 저는 K봇이에요 🤖\nK-컬처에 관한 무엇이든 물어보세요!',
    kbotPlaceholder: 'K봇에게 질문하세요...',
    kbotSend: '전송',
    kbotSuggestion1: 'BTS 슈가 컴백 언제?',
    kbotSuggestion2: '한국 드라마 추천해줘',
    kbotSuggestion3: '불닭볶음면 어떻게 만들어?',
    kbotSuggestion4: '유리 피부 만드는 법',
    namePlaceholder: '이름을 입력하세요',
    handlePlaceholder: '핸들을 입력하세요',
    bioPlaceholder: '자신을 소개해보세요'
  },
  en: {
    appName: 'K·WAVE',
    tabHome: 'Home',
    tabCommunity: 'Community',
    tabProfile: 'Profile',
    langLabel: 'Language',
    readMore: 'Read more',
    trendingNow: 'Trending Now',
    joinDiscussion: 'Join Discussion',
    addComment: 'Share your thoughts...',
    post: 'Post',
    back: 'Back',
    hotBadge: 'Hot',
    likeBadge: 'Likes',
    commentBadge: 'Comments',
    featuredLabel: 'Featured',
    searchPlaceholder: 'Enter a search term🙂',
    recentSearches: 'Recent Searches',
    trendingSearches: 'Trending Searches',
    notifications: 'Notifications',
    allRead: 'Mark all read',
    noResults: 'No results found',
    bookmarks: 'Bookmarks',
    activity: 'Activity',
    myBookmarks: 'Saved Content',
    myActivity: 'My Activity',
    noBookmarks: 'No saved content yet',
    noActivity: 'No activity yet',
    bookmarkHint: 'Bookmark articles to save them here',
    followers: 'Followers',
    following: 'Following',
    posts: 'Posts',
    editProfile: 'Edit Profile',
    settings: 'Settings',
    logout: 'Log out',
    myComment: 'My comment',
    onArticle: 'on article',
    liked: 'Liked',
    save: 'Save',
    cancel: 'Cancel',
    name: 'Name',
    handle: 'Handle',
    bio: 'Bio',
    country: 'Country',
    changePhoto: 'Change Image',
    editProfileTitle: 'Edit Profile',
    settingsTitle: 'Settings',
    notificationSettings: 'Notifications',
    pushNotifications: 'Push Notifications',
    pushNotificationsDesc: 'Allow push notifications for new alerts',
    commentAlerts: 'Comment Alerts',
    commentAlertsDesc: 'Get notified when someone comments on your post',
    trendingAlerts: 'Trending Alerts',
    trendingAlertsDesc: 'Get notified when a topic you follow trends',
    displaySettings: 'Display',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Use dark theme (coming soon)',
    privacySettings: 'Privacy',
    privateAccount: 'Private Account',
    privateAccountDesc: 'Only followers can see your activity',
    showActivity: 'Show Activity',
    showActivityDesc: 'Make your likes and comments public',
    accountSettings: 'Account',
    deleteAccount: 'Delete Account',
    deleteAccountDesc: 'Permanently delete your account and all data',
    appVersion: 'App Version',
    helpCenter: 'Help Center',
    kbot: 'Ask K-Bot',
    kbotTitle: 'K-Bot',
    kbotSubtitle: 'K-Culture AI Assistant',
    kbotWelcome: "Hi there! I'm K-Bot 🤖\nAsk me anything about K-Culture!",
    kbotPlaceholder: 'Ask K-Bot anything...',
    kbotSend: 'Send',
    kbotSuggestion1: 'When is Suga coming back?',
    kbotSuggestion2: 'Recommend a K-Drama',
    kbotSuggestion3: 'How to make Buldak noodles?',
    kbotSuggestion4: 'How to get glass skin?',
    namePlaceholder: 'Enter your name',
    handlePlaceholder: 'Enter your handle',
    bioPlaceholder: 'Tell us about yourself'
  },
  ja: {
    appName: 'K·WAVE',
    tabHome: 'ホーム',
    tabCommunity: 'コミュニティ',
    tabProfile: 'プロフィール',
    langLabel: '言語',
    readMore: '続きを読む',
    trendingNow: '今トレンド',
    joinDiscussion: '議論に参加',
    addComment: 'コメントを書く...',
    post: '投稿',
    back: '戻る',
    hotBadge: 'HOT',
    likeBadge: 'いいね',
    commentBadge: 'コメント',
    featuredLabel: '注目記事',
    searchPlaceholder: '検索ワードを入力してください🙂',
    recentSearches: '最近の検索',
    trendingSearches: '人気検索ワード',
    notifications: '通知',
    allRead: 'すべて既読',
    noResults: '結果が見つかりません',
    bookmarks: 'ブックマーク',
    activity: 'アクティビティ',
    myBookmarks: '保存したコンテンツ',
    myActivity: '自分のアクティビティ',
    noBookmarks: 'まだ保存されたコンテンツはありません',
    noActivity: 'まだアクティビティはありません',
    bookmarkHint: '記事をブックマークして保存しましょう',
    followers: 'フォロワー',
    following: 'フォロー中',
    posts: '投稿',
    editProfile: 'プロフィール編集',
    settings: '設定',
    logout: 'ログアウト',
    myComment: '自分のコメント',
    onArticle: 'の記事',
    liked: 'いいね済み',
    save: '保存',
    cancel: 'キャンセル',
    name: '名前',
    handle: 'ハンドル',
    bio: '自己紹介',
    country: '国',
    changePhoto: '画像を変更',
    editProfileTitle: 'プロフィール編集',
    settingsTitle: '設定',
    notificationSettings: '通知設定',
    pushNotifications: 'プッシュ通知',
    pushNotificationsDesc: '新しい通知を受信したときにプッシュ通知を許可',
    commentAlerts: 'コメント通知',
    commentAlertsDesc: '自分の投稿にコメントがあったとき通知',
    trendingAlerts: 'トレンド通知',
    trendingAlertsDesc: 'フォロー中のトピックがトレンドになったとき通知',
    displaySettings: '表示設定',
    darkMode: 'ダークモード',
    darkModeDesc: 'ダークテーマを使用（準備中）',
    privacySettings: 'プライバシー',
    privateAccount: '非公開アカウント',
    privateAccountDesc: 'フォロワーのみあなたの活動を見られます',
    showActivity: '活動を公開',
    showActivityDesc: 'いいねとコメント活動を公開する',
    accountSettings: 'アカウント',
    deleteAccount: 'アカウント削除',
    deleteAccountDesc: 'アカウントと全データを削除します',
    appVersion: 'アプリバージョン',
    helpCenter: 'ヘルプ',
    kbot: 'K-Botに聞く',
    kbotTitle: 'K-Bot',
    kbotSubtitle: 'K-カルチャーAIアシスタント',
    kbotWelcome: 'こんにちは！K-Botです 🤖\nK-カルチャーについて何でも聞いてください！',
    kbotPlaceholder: 'K-Botに質問する...',
    kbotSend: '送信',
    kbotSuggestion1: 'SUGAのカムバックはいつ？',
    kbotSuggestion2: '韓国ドラマを推薦して',
    kbotSuggestion3: 'プルダックの作り方は？',
    kbotSuggestion4: 'ガラス肌の作り方は？',
    namePlaceholder: '名前を入力してください',
    handlePlaceholder: 'ハンドルを入力してください',
    bioPlaceholder: '自己紹介を書いてください'
  },
  vi: {
    appName: 'K·WAVE',
    tabHome: 'Trang chủ',
    tabCommunity: 'Cộng đồng',
    tabProfile: 'Hồ sơ',
    langLabel: 'Ngôn ngữ',
    readMore: 'Xem thêm',
    trendingNow: 'Đang Thịnh Hành',
    joinDiscussion: 'Tham gia thảo luận',
    addComment: 'Chia sẻ ý kiến...',
    post: 'Đăng',
    back: 'Quay lại',
    hotBadge: 'Nóng',
    likeBadge: 'Thích',
    commentBadge: 'Bình luận',
    featuredLabel: 'Nổi bật',
    searchPlaceholder: 'Nhập từ khóa tìm kiếm🙂',
    recentSearches: 'Tìm kiếm gần đây',
    trendingSearches: 'Từ khoá thịnh hành',
    notifications: 'Thông báo',
    allRead: 'Đánh dấu đã đọc',
    noResults: 'Không tìm thấy kết quả',
    bookmarks: 'Đã lưu',
    activity: 'Hoạt động',
    myBookmarks: 'Nội dung đã lưu',
    myActivity: 'Hoạt động của tôi',
    noBookmarks: 'Chưa có nội dung nào được lưu',
    noActivity: 'Chưa có hoạt động nào',
    bookmarkHint: 'Lưu bài viết để xem lại sau',
    followers: 'Người theo dõi',
    following: 'Đang theo dõi',
    posts: 'Bài đăng',
    editProfile: 'Chỉnh sửa hồ sơ',
    settings: 'Cài đặt',
    logout: 'Đăng xuất',
    myComment: 'Bình luận của tôi',
    onArticle: 'trong bài viết',
    liked: 'Đã thích',
    save: 'Lưu',
    cancel: 'Hủy',
    name: 'Tên',
    handle: 'Handle',
    bio: 'Tiểu sử',
    country: 'Quốc gia',
    changePhoto: 'Đổi ảnh',
    editProfileTitle: 'Chỉnh sửa hồ sơ',
    settingsTitle: 'Cài đặt',
    notificationSettings: 'Thông báo',
    pushNotifications: 'Thông báo đẩy',
    pushNotificationsDesc: 'Cho phép thông báo đẩy khi có cảnh báo mới',
    commentAlerts: 'Cảnh báo bình luận',
    commentAlertsDesc: 'Nhận thông báo khi ai đó bình luận bài của bạn',
    trendingAlerts: 'Cảnh báo thịnh hành',
    trendingAlertsDesc: 'Nhận thông báo khi chủ đề bạn theo dõi thịnh hành',
    displaySettings: 'Hiển thị',
    darkMode: 'Chế độ tối',
    darkModeDesc: 'Dùng giao diện tối (sắp ra mắt)',
    privacySettings: 'Quyền riêng tư',
    privateAccount: 'Tài khoản riêng tư',
    privateAccountDesc: 'Chỉ người theo dõi mới thấy hoạt động của bạn',
    showActivity: 'Hiện hoạt động',
    showActivityDesc: 'Công khai lượt thích và bình luận của bạn',
    accountSettings: 'Tài khoản',
    deleteAccount: 'Xóa tài khoản',
    deleteAccountDesc: 'Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu',
    appVersion: 'Phiên bản ứng dụng',
    helpCenter: 'Trung tâm hỗ trợ',
    kbot: 'Hỏi K-Bot',
    kbotTitle: 'K-Bot',
    kbotSubtitle: 'Trợ lý AI K-Culture',
    kbotWelcome: 'Xin chào! Tôi là K-Bot 🤖\nHỏi tôi bất cứ điều gì về K-Culture!',
    kbotPlaceholder: 'Hỏi K-Bot bất cứ điều gì...',
    kbotSend: 'Gửi',
    kbotSuggestion1: 'Suga comeback khi nào?',
    kbotSuggestion2: 'Gợi ý phim Hàn hay',
    kbotSuggestion3: 'Cách làm mì Buldak?',
    kbotSuggestion4: 'Cách có làn da thủy tinh?',
    namePlaceholder: 'Nhập tên của bạn',
    handlePlaceholder: 'Nhập handle của bạn',
    bioPlaceholder: 'Giới thiệu về bản thân'
  }
};
const LANG_OPTIONS: {
  id: Lang;
  label: string;
  flag: string;
}[] = [{
  id: 'ko',
  label: '한국어',
  flag: '🇰🇷'
}, {
  id: 'en',
  label: 'English',
  flag: '🇺🇸'
}, {
  id: 'ja',
  label: '日本語',
  flag: '🇯🇵'
}, {
  id: 'vi',
  label: 'Tiếng Việt',
  flag: '🇻🇳'
}];
const COUNTRY_OPTIONS: {
  flag: string;
  label: string;
  value: string;
}[] = [{
  flag: '🇰🇷',
  label: '한국',
  value: 'kr'
}, {
  flag: '🇺🇸',
  label: 'USA',
  value: 'us'
}, {
  flag: '🇯🇵',
  label: '日本',
  value: 'jp'
}, {
  flag: '🇻🇳',
  label: 'Việt Nam',
  value: 'vn'
}, {
  flag: '🇨🇳',
  label: '中国',
  value: 'cn'
}, {
  flag: '🇹🇭',
  label: 'ไทย',
  value: 'th'
}, {
  flag: '🇵🇭',
  label: 'Philippines',
  value: 'ph'
}, {
  flag: '🇮🇩',
  label: 'Indonesia',
  value: 'id'
}, {
  flag: '🇲🇾',
  label: 'Malaysia',
  value: 'my'
}, {
  flag: '🇸🇬',
  label: 'Singapore',
  value: 'sg'
}, {
  flag: '🇹🇼',
  label: '台灣',
  value: 'tw'
}, {
  flag: '🇭🇰',
  label: 'Hong Kong',
  value: 'hk'
}, {
  flag: '🇬🇧',
  label: 'UK',
  value: 'gb'
}, {
  flag: '🇩🇪',
  label: 'Deutschland',
  value: 'de'
}, {
  flag: '🇫🇷',
  label: 'France',
  value: 'fr'
}, {
  flag: '🇪🇸',
  label: 'España',
  value: 'es'
}, {
  flag: '🇮🇹',
  label: 'Italia',
  value: 'it'
}, {
  flag: '🇵🇹',
  label: 'Portugal',
  value: 'pt'
}, {
  flag: '🇧🇷',
  label: 'Brasil',
  value: 'br'
}, {
  flag: '🇲🇽',
  label: 'México',
  value: 'mx'
}, {
  flag: '🇦🇷',
  label: 'Argentina',
  value: 'ar'
}, {
  flag: '🇨🇴',
  label: 'Colombia',
  value: 'co'
}, {
  flag: '🇨🇦',
  label: 'Canada',
  value: 'ca'
}, {
  flag: '🇦🇺',
  label: 'Australia',
  value: 'au'
}, {
  flag: '🇳🇿',
  label: 'New Zealand',
  value: 'nz'
}, {
  flag: '🇷🇺',
  label: 'Россия',
  value: 'ru'
}, {
  flag: '🇵🇱',
  label: 'Polska',
  value: 'pl'
}, {
  flag: '🇳🇱',
  label: 'Nederland',
  value: 'nl'
}, {
  flag: '🇸🇦',
  label: 'Saudi Arabia',
  value: 'sa'
}, {
  flag: '🇦🇪',
  label: 'UAE',
  value: 'ae'
}, {
  flag: '🇮🇳',
  label: 'India',
  value: 'in'
}, {
  flag: '🇵🇰',
  label: 'Pakistan',
  value: 'pk'
}, {
  flag: '🇳🇬',
  label: 'Nigeria',
  value: 'ng'
}, {
  flag: '🇿🇦',
  label: 'South Africa',
  value: 'za'
}, {
  flag: '🌏',
  label: 'Other',
  value: 'other'
}];
const HOT_NEWS_LIST: {
  id: string;
  title: Record<Lang, string>;
  source: Record<Lang, string>;
  image: string;
  articleId: string;
}[] = [{
  id: 'hn1',
  title: {
    ko: 'BTS 슈가, 전역 후 첫 공식 활동 재개… 솔로 프로젝트 하반기 확정',
    en: 'BTS Suga Returns After Military Discharge — Solo Project Confirmed for H2',
    ja: 'BTS SUGA除隊後初の公式活動、ソロプロジェクトが下半期に確定',
    vi: 'Suga BTS tái xuất sau nghĩa vụ quân sự — Dự án solo xác nhận nửa cuối năm'
  },
  source: {
    ko: '한국경제',
    en: 'Korea Economic Daily',
    ja: '韓国経済新聞',
    vi: 'Korea Economic Daily'
  },
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
  articleId: 'a1'
}, {
  id: 'hn2',
  title: {
    ko: '넷플릭스 오리지널 《폭풍의 언덕》 한국판, 공개 3일 만에 글로벌 TOP 10 진입',
    en: 'Netflix Korean Original "Storm on the Hill" Cracks Global Top 10 in Just 3 Days',
    ja: 'Netflixオリジナル韓国版「嵐の丘」が公開3日でグローバルTOP10入り',
    vi: '"Đồi Bão Tố" bản Hàn của Netflix lọt Top 10 toàn cầu chỉ sau 3 ngày'
  },
  source: {
    ko: '조선일보',
    en: 'Chosun Ilbo',
    ja: '朝鮮日報',
    vi: 'Chosun Ilbo'
  },
  image: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=200&h=200&fit=crop',
  articleId: 'a2'
}, {
  id: 'hn3',
  title: {
    ko: 'BLACKPINK 제니, 솔로 2집 선공개 타이틀곡 스포… SNS 달군 글로벌 반응',
    en: 'BLACKPINK Jennie Teases Solo Album 2 Title Track — Global SNS Reaction Explodes',
    ja: 'BLACKPINKジェニー、ソロ2ndアルバムタイトル曲をスポイル、SNSで世界的反応',
    vi: 'Jennie BLACKPINK hé lộ ca khúc chủ đề album solo 2 — Phản ứng toàn cầu bùng nổ trên SNS'
  },
  source: {
    ko: '매일경제',
    en: 'Maeil Business Newspaper',
    ja: '毎日経済新聞',
    vi: 'Maeil Business Newspaper'
  },
  image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&h=200&fit=crop',
  articleId: 'a5'
}, {
  id: 'hn4',
  title: {
    ko: '아이브 월드투어 전석 매진… 미국 5개 도시 추가 공연 확정',
    en: 'IVE World Tour Sells Out — 5 More US Cities Added',
    ja: 'IVEのワールドツアーが完売、米国5都市の追加公演が確定',
    vi: 'World tour của IVE cháy vé — Thêm 5 thành phố tại Mỹ'
  },
  source: {
    ko: 'MBC',
    en: 'MBC',
    ja: 'MBC',
    vi: 'MBC'
  },
  image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=200&h=200&fit=crop',
  articleId: 'a7'
}, {
  id: 'hn5',
  title: {
    ko: '한국 라면, 유럽 수출액 사상 최고… 불닭·신라면 현지 슈퍼마켓 전용 코너 설치',
    en: 'Korean Ramen Hits Record EU Exports — Buldak & Shin Ramen Get Dedicated Supermarket Aisles',
    ja: '韓国ラーメンが欧州輸出過去最高を記録、ブルダック・辛ラーメンが専用コーナーを設置',
    vi: 'Mì Hàn Quốc phá kỷ lục xuất khẩu châu Âu — Buldak & Shin Ramen có góc riêng tại siêu thị'
  },
  source: {
    ko: '중앙일보',
    en: 'JoongAng Ilbo',
    ja: '中央日報',
    vi: 'JoongAng Ilbo'
  },
  image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=200&h=200&fit=crop',
  articleId: 'a3'
}];
// --- K봇 Mock Responses ---
const KBOT_RESPONSES: Record<string, Record<Lang, string>> = {
  default: {
    ko: '좋은 질문이에요! K-컬처에 대해 더 알고 싶으시면 언제든지 물어보세요 😊',
    en: 'Great question! Feel free to ask me anything about K-Culture 😊',
    ja: '良い質問ですね！K-カルチャーについて何でも聞いてください 😊',
    vi: 'Câu hỏi hay đấy! Hỏi tôi bất cứ điều gì về K-Culture nhé 😊'
  },
  suga: {
    ko: '슈가(Suga, 민윤기)는 2024년 6월 전역했어요! 🎉 현재 HYBE에서 솔로 프로젝트를 준비 중이라고 공식 확인됐어요. Agust D 감성의 신곡 기대해볼까요? 🎵',
    en: "Suga (Min Yoongi) was discharged in June 2024! 🎉 HYBE has officially confirmed he's preparing a solo project. Can't wait for that Agust D energy! 🎵",
    ja: 'SUGA（ミン・ユンギ）は2024年6月に除隊しました！🎉 HYBEがソロプロジェクトを準備中と公式確認。Agust Dの新曲が楽しみですね！🎵',
    vi: 'Suga (Min Yoongi) đã xuất ngũ vào tháng 6/2024! 🎉 HYBE chính thức xác nhận anh ấy đang chuẩn bị dự án solo. Chờ đợi năng lượng Agust D thôi! 🎵'
  },
  drama: {
    ko: '요즘 핫한 드라마를 추천해드릴게요! 📺\n\n1. 《폭풍의 언덕》 한국판 — 넷플릭스 글로벌 TOP 10\n2. 《무빙》— 액션 히어로물의 새 지평\n3. 《나의 아저씨》— 감동 명작\n\n어떤 장르를 좋아하세요?',
    en: "Here are some hot K-Drama picks! 📺\n\n1. 'Storm on the Hill' — Netflix Global Top 10\n2. 'Moving' — Epic superhero action\n3. 'My Mister' — A timeless masterpiece\n\nWhat genre do you prefer?",
    ja: '最近話題の韓国ドラマをご紹介！📺\n\n1.「嵐の丘」韓国版 — NetflixグローバルTOP10\n2.「ムービング」— アクションヒーロー物の新境地\n3.「マイ・ディア・ミスター」— 感動の名作\n\nどんなジャンルが好きですか？',
    vi: 'Đây là những bộ phim Hàn đang hot! 📺\n\n1. "Đồi Bão Tố" bản Hàn — Top 10 Netflix toàn cầu\n2. "Moving" — Siêu anh hùng đỉnh cao\n3. "Anh Trai Của Tôi" — Kiệt tác bất hủ\n\nBạn thích thể loại nào?'
  },
  buldak: {
    ko: '불닭볶음면 레시피 알려드릴게요! 🔥\n\n1. 면을 5분간 끓여주세요\n2. 물을 버리고 소스와 버터 한 조각 추가\n3. 치즈 한 장 올리고 잘 섞어요\n4. 계란 후라이 올리면 완성! 🍳\n\n꿀팁: 우유 한 잔 마시면 매운맛 완화돼요!',
    en: "Here's how to make Buldak noodles! 🔥\n\n1. Boil noodles for 5 minutes\n2. Drain water, add sauce and a pat of butter\n3. Top with a cheese slice and mix well\n4. Add a fried egg for the full experience! 🍳\n\nTip: Drink milk to cool down the spice!",
    ja: 'プルダック炒め麺のレシピです！🔥\n\n1. 麺を5分茹でる\n2. 湯切りしてソースとバターを加える\n3. チーズ1枚をのせてよく混ぜる\n4. 目玉焼きをトッピングして完成！🍳\n\nヒント：牛乳を飲むと辛さが和らぎます！',
    vi: 'Đây là cách làm mì Buldak! 🔥\n\n1. Luộc mì trong 5 phút\n2. Đổ nước, thêm sốt và một miếng bơ\n3. Phủ lát phô mai và trộn đều\n4. Thêm trứng ốp la là xong! 🍳\n\nMẹo: Uống sữa để giảm cay nhé!'
  },
  glassskin: {
    ko: '유리 피부 K-뷰티 루틴 공개! ✨\n\n1. 이중 세안 (오일 → 폼)\n2. 토너 여러 번 두드리기\n3. 에센스 & 세럼 레이어링\n4. 시트 마스크 (주 3회)\n5. 수분 크림 듬뿍 + SPF 마무리\n\n꾸준함이 핵심이에요! 피부 타입도 알려주시면 더 자세히 안내해드릴게요 💆',
    en: 'Glass skin K-Beauty routine revealed! ✨\n\n1. Double cleanse (oil → foam)\n2. Multi-pat toning\n3. Essence & serum layering\n4. Sheet mask (3x/week)\n5. Rich moisturizer + SPF finish\n\nConsistency is key! Tell me your skin type for more tips 💆',
    ja: 'ガラス肌K-ビューティールーティン公開！✨\n\n1. ダブルクレンジング（オイル→フォーム）\n2. トナーを何度もパッティング\n3. エッセンス＆セラムのレイヤリング\n4. シートマスク（週3回）\n5. 保湿クリーム＋SPFで仕上げ\n\n継続が大切！肌タイプを教えてください 💆',
    vi: 'Bí quyết da thủy tinh K-Beauty! ✨\n\n1. Tẩy trang kép (dầu → sữa rửa mặt)\n2. Vỗ nhẹ toner nhiều lần\n3. Layering essence & serum\n4. Mặt nạ giấy (3 lần/tuần)\n5. Kem dưỡng ẩm dày + SPF hoàn tất\n\nKiên trì là chìa khóa! Cho tôi biết loại da của bạn nhé 💆'
  }
};
const KBOT_SUGGESTIONS: {
  id: string;
  key: string;
}[] = [{
  id: 's1',
  key: 'kbotSuggestion1'
}, {
  id: 's2',
  key: 'kbotSuggestion2'
}, {
  id: 's3',
  key: 'kbotSuggestion3'
}, {
  id: 's4',
  key: 'kbotSuggestion4'
}];
function getKbotResponse(text: string, lang: Lang): string {
  const lower = text.toLowerCase();
  if (lower.includes('슈가') || lower.includes('suga') || lower.includes('컴백') || lower.includes('comeback') || lower.includes('カムバック') || lower.includes('trở lại')) return KBOT_RESPONSES.suga[lang];
  if (lower.includes('드라마') || lower.includes('drama') || lower.includes('ドラマ') || lower.includes('phim')) return KBOT_RESPONSES.drama[lang];
  if (lower.includes('불닭') || lower.includes('buldak') || lower.includes('라면') || lower.includes('ramen') || lower.includes('mì') || lower.includes('noodle')) return KBOT_RESPONSES.buldak[lang];
  if (lower.includes('유리') || lower.includes('glass') || lower.includes('ガラス') || lower.includes('thủy tinh') || lower.includes('피부') || lower.includes('skin') || lower.includes('뷰티') || lower.includes('beauty')) return KBOT_RESPONSES.glassskin[lang];
  return KBOT_RESPONSES.default[lang];
}

// --- Mock Data ---
const ARTICLES: Article[] = [{
  id: 'a1',
  category: 'K-POP',
  categoryKey: 'kpop',
  categoryColor: 'bg-pink-500',
  categoryBg: 'from-pink-500 to-rose-600',
  title: {
    ko: 'BTS 슈가, 전역 후 첫 공식 활동 재개… 솔로 프로젝트 하반기 확정',
    en: 'BTS Suga Returns After Military Discharge — Solo Project Confirmed for H2',
    ja: 'BTS SUGA除隊後初の公式活動、ソロプロジェクトが下半期に確定',
    vi: 'Suga BTS tái xuất sau nghĩa vụ quân sự — Dự án solo xác nhận nửa cuối năm'
  },
  body: {
    ko: ['BTS 슈가(본명 민윤기)가 2024년 6월 병역 의무를 마치고 전역한 후, 올해 하반기를 목표로 솔로 프로젝트를 준비 중인 것으로 공식 확인됐다. HYBE 측은 공식 성명을 통해 "슈가의 컴백 관련 세부 사항은 추후 공개하겠다"고 밝혔다.', '글로벌 팬덤 ARMY는 SNS 전반에 걸쳐 뜨거운 환영 메시지를 쏟아냈다. 트위터(현 X)에서는 "SUGA IS BACK"이 전 세계 트렌드 1위를 기록했으며, 유튜브 라이브 스트리밍에는 동시 접속자 200만 명이 몰렸다.', '업계 관계자는 "슈가의 솔로 앨범 Agust D 시리즈가 전 세계적으로 높은 평가를 받은 만큼, 이번 신보에 대한 기대치가 상당히 높다"며 "힙합과 감성적 팝 사이에서 그만의 색깔을 더욱 깊이 있게 풀어낼 것으로 예상된다"고 전했다.', '슈가는 군 복무 기간에도 팬들과의 소통을 지속해 왔으며, 전역 직후 인스타그램 라이브를 통해 "오래 기다려줘서 고마웠고, 좋은 음악으로 보답하겠다"는 메시지를 남겨 팬들의 뜨거운 환호를 받았다.'],
    en: ['BTS member Suga (Min Yoongi) officially discharged from his mandatory military service in June 2024, and a solo project for the second half of this year has now been confirmed. HYBE stated in an official release that "details regarding Suga\'s comeback will be revealed in due course."', 'The global ARMY fandom erupted across social media platforms. "SUGA IS BACK" trended #1 worldwide on X (formerly Twitter), while a YouTube livestream drew over 2 million concurrent viewers.', 'An industry insider noted, "Given the global critical acclaim of the Agust D solo series, expectations for this new release are exceptionally high. He\'s expected to push deeper into his signature blend of hip-hop and introspective pop."', 'Throughout his military service, Suga maintained connection with fans, and in an Instagram Live shortly after discharge, he expressed: "Thank you for waiting so long. I\'ll repay you with great music," drawing an outpouring of emotional responses.'],
    ja: ['BTSのSUGA（本名：ミン・ユンギ）が2024年6月に兵役を終え除隊し、今年下半期のソロプロジェクトが公式確定した。HYBEは公式声明で「SUGAのカムバックに関する詳細は追って公開する」と述べた。', 'グローバルファンダムARMYはSNS全体で熱狂的な歓迎メッセージを送った。X（旧Twitter）では「SUGA IS BACK」が世界トレンド1位を記録し、YouTubeライブストリーミングには同時接続者200万人が殺到した。', '業界関係者は「Agust Dソロシリーズが世界的に高い評価を受けているだけに、新アルバムへの期待値は非常に高い。ヒップホップと内省的なポップを融合した独自のスタイルをさらに深化させると予想される」と語った。', 'SUGA は兵役中もファンとの交流を続け、除隊直後のInstagramライブで「長い間待ってくれてありがとう。良い音楽でお返しします」というメッセージを残し、ファンの熱狂的な反響を呼んだ。'],
    vi: ['Thành viên Suga của BTS (tên thật Min Yoongi) đã hoàn thành nghĩa vụ quân sự vào tháng 6/2024, và dự án solo trong nửa cuối năm nay đã được chính thức xác nhận. HYBE cho biết trong tuyên bố chính thức: "Chi tiết về sự trở lại của Suga sẽ được tiết lộ sau."', 'Fandom ARMY toàn cầu nổ ra trên khắp mạng xã hội. "SUGA IS BACK" lên xu hướng số 1 toàn cầu trên X (trước đây là Twitter), trong khi livestream YouTube thu hút hơn 2 triệu người xem đồng thời.', 'Một người trong ngành nhận xét: "Với sự thành công toàn cầu của series solo Agust D, kỳ vọng vào album mới cực kỳ cao. Anh ấy được dự đoán sẽ đào sâu hơn vào phong cách pha trộn hip-hop và pop nội tâm đặc trưng của mình."', 'Trong suốt thời gian quân ngũ, Suga vẫn duy trì kết nối với người hâm mộ, và trong một buổi Instagram Live ngay sau xuất ngũ, anh chia sẻ: "Cảm ơn đã chờ đợi lâu như vậy. Tôi sẽ đền đáp bằng âm nhạc tuyệt vời."']
  },
  source: {
    ko: '한국경제',
    en: 'Korea Economic Daily',
    ja: '韓国経済新聞',
    vi: 'Korea Economic Daily'
  },
  timeAgo: {
    ko: '1시간 전',
    en: '1h ago',
    ja: '1時間前',
    vi: '1 giờ trước'
  },
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop',
  likes: 4821,
  comments: 312,
  isFeatured: true
}, {
  id: 'a2',
  category: 'K-DRAMA',
  categoryKey: 'kdrama',
  categoryColor: 'bg-violet-500',
  categoryBg: 'from-violet-500 to-purple-700',
  title: {
    ko: '넷플릭스 오리지널 《폭풍의 언덕》 한국판, 공개 3일 만에 글로벌 TOP 10 진입',
    en: 'Netflix Korean Original "Storm on the Hill" Cracks Global Top 10 in Just 3 Days',
    ja: 'Netflixオリジナル韓国版「嵐の丘」が公開3日でグローバルTOP10入り',
    vi: '"Đồi Bão Tố" bản Hàn của Netflix lọt Top 10 toàn cầu chỉ sau 3 ngày'
  },
  body: {
    ko: ['넷플릭스 오리지널 한국 드라마 《폭풍의 언덕》이 공개 사흘 만에 글로벌 TOP 10에 진입하며 한국 드라마의 저력을 다시 한번 증명했다. 에밀리 브롱테의 동명 원작 소설을 한국적 감성으로 재해석한 이 작품은 15개국 차트 상위권에 동시 안착했다.', '연출을 맡은 박지훈 감독은 "원작의 폭풍 같은 감정선은 그대로 살리되, 한국의 정서와 계절감을 입혀 전혀 새로운 세계를 만들고 싶었다"고 밝혔다. 주연을 맡은 배우 이수아와 정우성은 각각 캐서린과 히스클리프를 한국식으로 재해석하며 평단의 극찬을 받았다.', 'OST 역시 화제를 모으고 있다. 1화 엔딩에 삽입된 발라드곡은 공개 12시간 만에 멜론 실시간 차트 1위에 오르며, K-드라마 OST의 힘을 다시 한번 입증했다. 전문 평론가들은 "2020년대 K-드라마의 새로운 기준점이 될 것"이라는 평가를 내놓고 있다.', '넷플릭스 코리아 측은 "이미 시즌 2 제작 논의가 진행 중"이라고 밝혀 팬들의 기대감을 높이고 있다. 해외 영화제에서도 러브콜이 이어지고 있으며, 베를린 국제 영화제 출품이 유력한 것으로 알려졌다.'],
    en: ['Netflix\'s Korean original drama "Storm on the Hill" entered the global Top 10 within just three days of release, once again proving the enduring power of Korean drama. This Korean reinterpretation of Emily Brontë\'s classic novel simultaneously ranked in the top charts of 15 countries.', 'Director Park Ji-hun stated, "I wanted to preserve the stormy emotional core of the original while dressing it in Korean sensibility and the feeling of its seasons — creating an entirely new world." Lead actors Lee Sua and Jung Woo-sung received critical acclaim for their Korean-inflected takes on Cathy and Heathcliff.', 'The OST has also generated buzz. The ballad featured at the end of Episode 1 topped Melon\'s real-time chart within 12 hours of release, once again proving the power of K-drama soundtracks. Critics are calling it "a new benchmark for K-drama in the 2020s."', 'Netflix Korea has hinted that discussions for a Season 2 are already underway. International film festivals have also been reaching out, with submission to the Berlin International Film Festival considered highly likely.'],
    ja: ['Netflixオリジナル韓国ドラマ「嵐の丘」が公開3日でグローバルTOP10に入り、韓国ドラマの底力を改めて証明した。エミリー・ブロンテの同名原作小説を韓国的感性で再解釈したこの作品は、15か国のチャートで同時に上位にランクインした。', '演出を担当したパク・ジフン監督は「原作の嵐のような感情の流れはそのままに、韓国の情緒と季節感を加えて全く新しい世界を作りたかった」と語った。主演のイ・スアとチョン・ウソンがそれぞれキャサリンとヒースクリフを韓国式に再解釈し、批評家から絶賛を受けた。', 'OSTも話題を呼んでいる。1話エンディングに挿入されたバラード曲は公開12時間でメロンリアルタイムチャート1位に輝き、K-ドラマOSTの力を改めて証明した。専門評論家たちは「2020年代のK-ドラマの新たな基準点になるだろう」と評価している。', 'Netflixコリアは「すでにシーズン2の制作協議が進行中」と明かし、ファンの期待を高めている。海外映画祭からもラブコールが続いており、ベルリン国際映画祭への出品が有力とされている。'],
    vi: ['Bộ phim gốc Hàn Quốc của Netflix "Đồi Bão Tố" đã vào Top 10 toàn cầu chỉ trong ba ngày kể từ khi phát hành, một lần nữa chứng minh sức mạnh bền bỉ của phim Hàn. Tác phẩm tái diễn giải theo phong cách Hàn Quốc tiểu thuyết kinh điển của Emily Brontë đồng thời xếp hạng cao tại 15 quốc gia.', 'Đạo diễn Park Ji-hun cho biết: "Tôi muốn giữ nguyên cốt lõi cảm xúc dữ dội của nguyên tác trong khi khoác lên nó cảm thức Hàn Quốc và hương vị các mùa — tạo ra một thế giới hoàn toàn mới." Các diễn viên chính Lee Sua và Jung Woo-sung được giới phê bình khen ngợi vì cách diễn giải theo phong cách Hàn đối với các nhân vật Cathy và Heathcliff.', 'OST cũng tạo ra tiếng vang lớn. Bản ballad ở cuối tập 1 đã leo lên đỉnh bảng xếp hạng thời gian thực của Melon chỉ trong 12 giờ, một lần nữa chứng tỏ sức mạnh của nhạc phim K-drama. Các nhà phê bình gọi đây là "tiêu chuẩn mới của K-drama trong thập kỷ 2020."', 'Netflix Korea đã gợi ý rằng các cuộc thảo luận về mùa 2 đang được tiến hành. Các liên hoan phim quốc tế cũng đang liên hệ, với việc gửi phim dự Liên hoan Phim Quốc tế Berlin được coi là rất có khả năng.']
  },
  source: {
    ko: '조선일보',
    en: 'Chosun Ilbo',
    ja: '朝鮮日報',
    vi: 'Chosun Ilbo'
  },
  timeAgo: {
    ko: '3시간 전',
    en: '3h ago',
    ja: '3時間前',
    vi: '3 giờ trước'
  },
  image: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800&h=500&fit=crop',
  likes: 2340,
  comments: 187
}, {
  id: 'a3',
  category: 'K-FOOD',
  categoryKey: 'kfood',
  categoryColor: 'bg-orange-500',
  categoryBg: 'from-orange-500 to-red-500',
  title: {
    ko: '한국 라면, 유럽 수출액 사상 최고… 불닭·신라면 현지 슈퍼마켓 전용 코너 설치',
    en: 'Korean Ramen Hits Record EU Exports — Buldak & Shin Ramen Get Dedicated Supermarket Aisles',
    ja: '韓国ラーメンが欧州輸出過去最高を記録、ブルダック・辛ラーメンが専用コーナーを設置',
    vi: 'Mì Hàn Quốc phá kỷ lục xuất khẩu châu Âu — Buldak & Shin Ramen có góc riêng tại siêu thị'
  },
  body: {
    ko: ['한국농수산식품유통공사(aT)가 발표한 최신 통계에 따르면, 2024년 1분기 한국 라면의 유럽 수출액이 전년 동기 대비 47.3% 급증하며 사상 최고치를 기록했다. 불닭볶음면과 신라면이 이 성장을 이끌었으며, 특히 프랑스·독일·영국에서의 판매량 증가가 두드러진다.', '프랑스 파리의 대형 슈퍼마켓 체인 카르푸는 지난달부터 매장 내 "K-누들존"을 신설했다. 담당 바이어는 "한국 라면은 이제 아시아 식품 코너를 넘어 주류 식품 코너에 자리잡는 단계에 왔다"며 "특히 20~30대 유럽 소비자들의 반응이 매우 뜨겁다"고 말했다.', '삼양식품과 농심은 유럽 현지 공장 설립도 검토 중이다. 삼양식품 관계자는 "현재 수출 물량으로는 유럽의 수요를 충당하기 어려운 상황"이라며 "유럽 내 생산 거점 마련을 위한 타당성 조사를 진행 중"이라고 밝혔다.', '이 같은 K-푸드 열풍의 배경에는 유튜브와 틱톡 등 SNS를 통한 한국 음식 콘텐츠의 폭발적 확산이 있다. 불닭볶음면 챌린지는 틱톡에서 누적 80억 뷰를 넘어섰으며, 현지 인플루언서들의 한국 요리 도전 영상이 매달 수천 건씩 게시되고 있다.'],
    en: ['According to the latest statistics from the Korea Agro-Fisheries & Food Trade Corporation (aT), Korean ramen exports to Europe surged 47.3% year-on-year in Q1 2024, hitting an all-time high. Buldak noodles and Shin Ramen are driving the growth, with notably strong sales increases in France, Germany, and the UK.', 'French supermarket chain Carrefour launched dedicated "K-Noodle Zones" across its Paris stores last month. A purchasing manager stated, "Korean ramen has now moved beyond the Asian food aisle to become a mainstream product. The response from European consumers in their 20s and 30s is exceptionally strong."', 'Samyang Foods and Nongshim are also considering establishing European production facilities. A Samyang spokesperson said, "Current export volumes are struggling to meet European demand," and confirmed a feasibility study is underway for a European manufacturing base.', 'Driving this K-Food wave is the explosive spread of Korean food content across YouTube and TikTok. The Buldak noodle challenge has surpassed 8 billion cumulative views on TikTok, with thousands of local influencer videos of Korean cooking challenges posted each month.'],
    ja: ['韓国農水産食品流通公社（aT）が発表した最新統計によると、2024年第1四半期の韓国ラーメンの欧州輸出額が前年同期比47.3%急増し、過去最高を更新した。プルダック炒め麺と辛ラーメンがこの成長を牽引しており、特にフランス・ドイツ・イギリスでの販売増加が目立つ。', 'フランス・パリの大手スーパーチェーンのカルフールは先月から「K-ヌードルゾーン」を新設した。担当バイヤーは「韓国ラーメンはアジア食品コーナーを超えて主流食品コーナーに進出する段階に来た」と述べ、「特に20〜30代の欧州消費者の反応が非常に熱い」と語った。', '三養食品とノンシムは欧州現地工場設立も検討中だ。三養食品関係者は「現在の輸出量では欧州の需要に応えるのが困難な状況」とし、「欧州内の生産拠点設立に向けた実現可能性調査を進めている」と明かした。', 'このK-フードブームの背景には、YouTubeやTikTokなどのSNSを通じた韓国食品コンテンツの爆発的な拡散がある。プルダック炒め麺チャレンジはTikTokで累計80億ビューを超え、現地インフルエンサーによる韓国料理挑戦動画が毎月数千件投稿されている。'],
    vi: ['Theo số liệu mới nhất từ Tổng công ty Phân phối Nông thủy sản Thực phẩm Hàn Quốc (aT), xuất khẩu mì Hàn Quốc sang châu Âu tăng vọt 47,3% so với cùng kỳ năm trước trong quý 1/2024, đạt mức kỷ lục. Mì Buldak và Shin Ramen đang thúc đẩy tăng trưởng này, với mức tăng doanh số đặc biệt mạnh tại Pháp, Đức và Anh.', 'Chuỗi siêu thị Carrefour của Pháp đã ra mắt "Góc mì K-Noodle" chuyên dụng tại các cửa hàng Paris từ tháng trước. Người mua hàng cho biết: "Mì Hàn Quốc đã vượt ra khỏi khu vực thực phẩm châu Á để trở thành sản phẩm chủ đạo. Phản ứng từ người tiêu dùng châu Âu trong độ tuổi 20-30 cực kỳ mạnh mẽ."', 'Samyang Foods và Nongshim cũng đang xem xét thiết lập cơ sở sản xuất tại châu Âu. Phát ngôn viên Samyang cho biết: "Khối lượng xuất khẩu hiện tại đang khó đáp ứng nhu cầu châu Âu" và xác nhận đang tiến hành nghiên cứu khả thi cho cơ sở sản xuất tại châu Âu.', 'Thúc đẩy làn sóng K-Food này là sự lan rộng bùng nổ của nội dung ẩm thực Hàn Quốc trên YouTube và TikTok. Thử thách mì Buldak đã vượt 8 tỷ lượt xem tích lũy trên TikTok, với hàng nghìn video thử thách nấu ăn Hàn Quốc của influencer địa phương được đăng mỗi tháng.']
  },
  source: {
    ko: '중앙일보',
    en: 'JoongAng Ilbo',
    ja: '中央日報',
    vi: 'JoongAng Ilbo'
  },
  timeAgo: {
    ko: '6시간 전',
    en: '6h ago',
    ja: '6時間前',
    vi: '6 giờ trước'
  },
  image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&h=500&fit=crop',
  likes: 1876,
  comments: 94
}, {
  id: 'a4',
  category: 'K-BEAUTY',
  categoryKey: 'kbeauty',
  categoryColor: 'bg-rose-400',
  categoryBg: 'from-rose-400 to-pink-600',
  title: {
    ko: '유리 피부·젤리 스킨 트렌드, K-뷰티가 2024년 글로벌 뷰티 시장 재패',
    en: 'Glass Skin & Jelly Skin Trends: K-Beauty Conquers the 2024 Global Beauty Market',
    ja: 'ガラス肌・ジェリー肌トレンド、K-ビューティーが2024年グローバル市場を席巻',
    vi: 'Xu hướng da thủy tinh & da thạch: K-Beauty chinh phục thị trường làm đẹp toàn cầu 2024'
  },
  body: {
    ko: ['세계 최대 뷰티 박람회 코스모프로프(Cosmoprof)에서 K-뷰티가 다시 한번 주목을 받았다. 유리 피부(Glass Skin)와 젤리 스킨 트렌드를 앞세운 한국 브랜드들이 유럽·북미 바이어들로부터 폭발적인 반응을 얻으며, K-뷰티의 글로벌 지배력을 재확인했다.', '아모레퍼시픽과 LG생활건강은 각각 프리미엄 광채 세럼 라인을 선보이며 현장에서만 수백억 원의 수출 계약을 체결한 것으로 알려졌다. 특히 「선스크린 선크림」의 초경량 텍스처와 높은 자외선 차단 지수가 해외 소비자들로부터 큰 호응을 얻었다.', '미국 세포라와 얼타뷰티는 올해 K-뷰티 전용 섹션을 대폭 확장하겠다는 계획을 발표했다. 얼타 측 담당자는 "K-뷰티 상품은 우리 매장에서 전체 스킨케어 카테고리 중 가장 빠른 성장세를 보이고 있다"며 "앞으로 5년간 K-뷰티 섹션을 3배 이상 키울 것"이라고 밝혔다.', '뷰티 전문 분석기관 BEAUTYDATA는 "2024년 전 세계 스킨케어 시장에서 한국산 제품의 점유율이 처음으로 15%를 돌파할 것"으로 전망했다. 이는 5년 전(2019년) 대비 두 배 이상 증가한 수치다.'],
    en: ['K-Beauty once again drew the spotlight at Cosmoprof, the world\'s largest beauty trade fair. Korean brands spearheading the Glass Skin and Jelly Skin trends received explosive reactions from European and North American buyers, reconfirming K-Beauty\'s global dominance.', 'AmorePacific and LG Household & Health Care reportedly secured export contracts worth hundreds of billions of won on-site by showcasing their premium luminous serum lines. In particular, the ultra-lightweight texture and high SPF of Korean sunscreens drew major enthusiasm from overseas consumers.', 'US retailers Sephora and Ulta Beauty both announced plans to significantly expand their dedicated K-Beauty sections this year. An Ulta representative stated, "K-Beauty products are showing the fastest growth of any skincare category in our stores," adding they plan to triple the K-Beauty section over the next five years.', 'Beauty analytics firm BEAUTYDATA projected that "Korean products will surpass 15% market share in global skincare for the first time in 2024" — more than double their share from five years ago in 2019.'],
    ja: ['世界最大のビューティー見本市コスモプロフで、K-ビューティーが再び注目を集めた。ガラス肌とジェリー肌トレンドを先導する韓国ブランドが欧州・北米バイヤーから爆発的な反響を得て、K-ビューティーのグローバル支配力を再確認した。', 'アモレパーシックとLG生活健康は、それぞれプレミアム光沢セラムラインを発表し、会場だけで数百億ウォンの輸出契約を締結したとされる。特に「サンスクリーン・サンクリーム」の超軽量テクスチャーと高いSPFが海外消費者から大きな反響を呼んだ。', '米セフォラとアルタビューティーは今年、K-ビューティー専用セクションを大幅に拡充する計画を発表した。アルタの担当者は「K-ビューティー商品は当店でスキンケアカテゴリー全体の中で最も速い成長を見せている」とし、「今後5年でK-ビューティーセクションを3倍以上に拡大する」と述べた。', 'ビューティー専門分析機関BEAUTYDATAは「2024年の世界スキンケア市場における韓国製品のシェアが初めて15%を突破する見込み」と予測した。これは5年前（2019年）の2倍以上の数字だ。'],
    vi: ['K-Beauty một lần nữa thu hút sự chú ý tại Cosmoprof, hội chợ làm đẹp lớn nhất thế giới. Các thương hiệu Hàn Quốc dẫn đầu xu hướng Da Thủy Tinh và Da Thạch nhận được phản ứng bùng nổ từ các khách mua hàng châu Âu và Bắc Mỹ, tái khẳng định sự thống trị toàn cầu của K-Beauty.', 'AmorePacific và LG Household & Health Care được cho là đã ký kết các hợp đồng xuất khẩu trị giá hàng trăm tỷ won ngay tại hội chợ khi ra mắt các dòng serum ánh sáng cao cấp. Đặc biệt, kết cấu siêu nhẹ và chỉ số SPF cao của kem chống nắng Hàn Quốc đã nhận được sự nhiệt tình lớn từ người tiêu dùng nước ngoài.', 'Các nhà bán lẻ Mỹ Sephora và Ulta Beauty đều thông báo kế hoạch mở rộng đáng kể khu vực K-Beauty dành riêng trong năm nay. Đại diện Ulta cho biết: "Sản phẩm K-Beauty đang cho thấy mức tăng trưởng nhanh nhất trong bất kỳ danh mục chăm sóc da nào tại cửa hàng của chúng tôi," và họ có kế hoạch tăng gấp ba khu vực K-Beauty trong năm năm tới.', 'Công ty phân tích làm đẹp BEAUTYDATA dự báo "Sản phẩm Hàn Quốc sẽ vượt 15% thị phần trong thị trường chăm sóc da toàn cầu lần đầu tiên vào năm 2024" — cao hơn gấp đôi so với năm năm trước vào năm 2019.']
  },
  source: {
    ko: '동아일보',
    en: 'Dong-A Ilbo',
    ja: '東亜日報',
    vi: 'Dong-A Ilbo'
  },
  timeAgo: {
    ko: '12시간 전',
    en: '12h ago',
    ja: '12時間前',
    vi: '12 giờ trước'
  },
  image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=500&fit=crop',
  likes: 3102,
  comments: 221
}, {
  id: 'a5',
  category: 'K-POP',
  categoryKey: 'kpop',
  categoryColor: 'bg-pink-500',
  categoryBg: 'from-pink-500 to-rose-600',
  title: {
    ko: 'BLACKPINK 제니, 솔로 2집 선공개 타이틀곡 스포… SNS 달군 글로벌 반응',
    en: 'BLACKPINK Jennie Teases Solo Album 2 Title Track — Global SNS Reaction Explodes',
    ja: 'BLACKPINKジェニー、ソロ2ndアルバムタイトル曲をスポイル、SNSで世界的反応',
    vi: 'Jennie BLACKPINK hé lộ ca khúc chủ đề album solo 2 — Phản ứng toàn cầu bùng nổ trên SNS'
  },
  body: {
    ko: ['BLACKPINK 제니가 본인 인스타그램에 솔로 2집 타이틀곡 일부를 스포하며 전 세계 팬들을 흥분시켰다. 15초 남짓의 짧은 클립이었지만, 게시 6시간 만에 \'좋아요\' 2,500만 건을 돌파했다. 새 앨범은 영국의 세계적인 프로듀서 마크 론슨과 협업한 것으로 알려졌다.', '공개된 클립에서는 트렌디한 팝 비트 위로 제니 특유의 독보적인 보컬이 얹혀, 전작 《솔로》와는 또 다른 성숙한 무드가 감지됐다. 팬들은 "이번엔 완전히 다른 제니를 만날 것 같다"는 반응을 보이며 기대감을 표현했다.', '업계에서는 이번 솔로 앨범이 제니의 독자적인 아티스트 정체성을 더욱 강화할 것으로 보고 있다. YG엔터테인먼트 측은 공식 입장을 자제하고 있지만, 정식 발매일 공개가 임박한 것으로 전해진다.', '제니의 솔로 활동은 최근 할리우드 드라마 출연과 글로벌 명품 브랜드 앰배서더 활동과도 맞물려 있어, 그녀의 글로벌 스타 입지를 더욱 확고히 할 전망이다. 패션 전문지 보그는 "제니는 현재 전 세계에서 가장 영향력 있는 패션 아이콘 중 한 명"이라고 평가했다.'],
    en: ['BLACKPINK\'s Jennie excited fans worldwide by teasing her Solo Album 2 title track on her Instagram. Despite being just over 15 seconds long, the clip surpassed 25 million likes within 6 hours of posting. The new album is reportedly a collaboration with world-renowned British producer Mark Ronson.', 'The clip revealed a trendy pop beat layered with Jennie\'s distinctively captivating vocals, hinting at a more mature mood distinct from her debut solo "SOLO." Fans responded with excitement: "It feels like we\'re about to meet a completely different Jennie."', 'Industry watchers believe this solo album will further solidify Jennie\'s identity as an independent artist. YG Entertainment has maintained official silence, but the formal release date announcement is understood to be imminent.', 'Jennie\'s solo activities come alongside recent Hollywood drama appearances and global luxury brand ambassadorships, further cementing her position as a global star. Fashion publication Vogue described her as "one of the most influential fashion icons in the world today."'],
    ja: ['BLACKPINKのジェニーが自身のInstagramにソロ2ndアルバムのタイトル曲の一部をスポイルし、世界中のファンを興奮させた。15秒ほどの短いクリップだったが、投稿から6時間で「いいね」が2500万件を突破した。新アルバムはイギリスの世界的プロデューサー、マーク・ロンソンとのコラボ作品として知られている。', '公開されたクリップでは、トレンディなポップビートにジェニー特有の独自のボーカルが乗り、前作「SOLO」とは異なる成熟したムードが感じられた。ファンは「今回は全く違うジェニーに会えそう」と反応し、期待感を表明した。', '業界ではこのソロアルバムがジェニーの独立したアーティストとしての正体性をさらに強化するとみている。YGエンターテインメント側は公式立場を自制しているが、正式発売日の公開が迫っていると伝えられる。', 'ジェニーのソロ活動は最近のハリウッドドラマ出演やグローバル高級ブランドのアンバサダー活動とも相まって、彼女のグローバルスターとしての地位をさらに確固たるものにする見通しだ。ファッション誌ヴォーグは「ジェニーは現在、世界で最も影響力のあるファッションアイコンの一人」と評価した。'],
    vi: ['Jennie của BLACKPINK đã gây hứng khởi cho người hâm mộ toàn thế giới khi hé lộ ca khúc chủ đề album solo 2 trên Instagram của mình. Dù chỉ hơn 15 giây, clip đã vượt 25 triệu lượt thích chỉ trong 6 giờ đăng tải. Album mới được cho là sự hợp tác với nhà sản xuất người Anh nổi tiếng thế giới Mark Ronson.', 'Clip tiết lộ một beat pop thịnh hành được phủ lên giọng ca thu hút đặc trưng của Jennie, gợi ý một tâm trạng trưởng thành hơn so với ca khúc solo đầu tiên "SOLO" của cô. Người hâm mộ phản ứng hào hứng: "Cảm giác như chúng ta sắp gặp một Jennie hoàn toàn khác."', 'Giới quan sát ngành tin rằng album solo này sẽ củng cố thêm bản sắc của Jennie như một nghệ sĩ độc lập. YG Entertainment vẫn giữ im lặng chính thức, nhưng thông báo ngày phát hành chính thức được hiểu là sắp đến.', 'Các hoạt động solo của Jennie đến cùng với các vai diễn trong phim Hollywood gần đây và vai trò đại sứ thương hiệu xa xỉ toàn cầu, càng củng cố thêm vị thế ngôi sao toàn cầu của cô. Tạp chí thời trang Vogue mô tả cô là "một trong những biểu tượng thời trang có ảnh hưởng nhất thế giới hiện nay."']
  },
  source: {
    ko: '매일경제',
    en: 'Maeil Business Newspaper',
    ja: '毎日経済新聞',
    vi: 'Maeil Business Newspaper'
  },
  timeAgo: {
    ko: '2시간 전',
    en: '2h ago',
    ja: '2時間前',
    vi: '2 giờ trước'
  },
  image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=500&fit=crop',
  likes: 5610,
  comments: 489
}, {
  id: 'a6',
  category: 'K-DRAMA',
  categoryKey: 'kdrama',
  categoryColor: 'bg-violet-500',
  categoryBg: 'from-violet-500 to-purple-700',
  title: {
    ko: '《오징어게임3》 제작 확정… 황동혁 감독 "마지막 시즌, 최고의 엔딩 약속"',
    en: '"Squid Game 3" Confirmed — Director Hwang Dong-hyuk Promises "The Best Ending Ever"',
    ja: '「イカゲーム3」制作確定、ファン・ドンヒョク監督「最後のシーズン、最高のエンディングを約束」',
    vi: '"Squid Game 3" được xác nhận — Đạo diễn Hwang Dong-hyuk hứa "Kết thúc hay nhất từ trước đến nay"'
  },
  body: {
    ko: ['넷플릭스가 공식적으로 《오징어게임 시즌3》 제작을 확정했다. 황동혁 감독은 공식 인터뷰에서 "세 번째 시즌은 진정한 피날레가 될 것이며, 팬들이 상상도 못 했던 반전과 감동을 선사할 것"이라고 말했다.', '시즌2에서 복귀한 기훈(이정재 분)의 운명을 중심으로 이야기가 전개될 것으로 예상된다. 황 감독은 "시즌3는 단순한 서바이벌 이야기를 넘어, 인간 본성과 사회 구조에 대한 더 깊은 질문을 던질 것"이라고 예고했다.', '넷플릭스는 시즌3 제작에 시즌2 대비 약 20% 더 많은 예산을 투입하는 것으로 알려졌다. 촬영은 2024년 하반기 시작해 2025년 말 또는 2026년 초 공개를 목표로 하고 있다.', '《오징어게임》은 2021년 첫 공개 이후 넷플릭스 역대 최고 시청 기록을 세우며 전 세계 문화 현상이 됐다. 에미상, 골든글로브 등 주요 시상식에서 수상을 이어가며 한국 콘텐츠의 위상을 크게 높였다.'],
    en: ['Netflix has officially confirmed production of Squid Game Season 3. Director Hwang Dong-hyuk stated in an official interview, "The third season will be a true finale, delivering twists and emotions that fans never could have imagined."', 'The story is expected to center on the fate of Gi-hun (Lee Jung-jae), who returned in Season 2. Director Hwang previewed, "Season 3 will go beyond a simple survival story to pose deeper questions about human nature and social structure."', 'Netflix is reportedly allocating approximately 20% more budget for Season 3 compared to Season 2. Filming is set to begin in the second half of 2024, targeting a late 2025 or early 2026 release.', 'Since its debut in 2021, Squid Game has set Netflix\'s all-time viewership records and become a global cultural phenomenon. Its continued wins at major awards including the Emmy Awards and Golden Globes have significantly elevated the prestige of Korean content worldwide.'],
    ja: ['Netflixが「イカゲーム シーズン3」の制作を公式確定した。ファン・ドンヒョク監督は公式インタビューで「第3シーズンは真のフィナーレとなり、ファンが想像もできなかった展開と感動を届ける」と語った。', 'シーズン2で復帰したギフン（イ・ジョンジェ）の運命を中心に話が展開すると予想される。ファン監督は「シーズン3は単純なサバイバルの話を超えて、人間の本性と社会構造についてのより深い問いを投げかける」と予告した。', 'Netflixはシーズン3の制作にシーズン2比約20%増の予算を投入するとされている。撮影は2024年下半期に開始し、2025年末か2026年初の公開を目指している。', '「イカゲーム」は2021年の初公開以来、Netflixの歴代最高視聴記録を更新し、世界的な文化現象となった。エミー賞、ゴールデングローブなど主要賞での受賞を続け、韓国コンテンツの地位を大きく高めた。'],
    vi: ['Netflix đã chính thức xác nhận sản xuất Squid Game Season 3. Đạo diễn Hwang Dong-hyuk nói trong một cuộc phỏng vấn chính thức: "Mùa thứ ba sẽ là một màn chung kết thực sự, mang đến những bất ngờ và cảm xúc mà người hâm mộ chưa bao giờ có thể tưởng tượng."', 'Câu chuyện dự kiến sẽ tập trung vào số phận của Gi-hun (Lee Jung-jae), người đã trở lại trong Season 2. Đạo diễn Hwang tiết lộ: "Season 3 sẽ vượt ra ngoài câu chuyện sinh tồn đơn thuần để đặt ra những câu hỏi sâu sắc hơn về bản chất con người và cấu trúc xã hội."', 'Netflix được cho là phân bổ ngân sách nhiều hơn khoảng 20% cho Season 3 so với Season 2. Quay phim dự kiến bắt đầu vào nửa cuối năm 2024, nhắm đến phát hành cuối 2025 hoặc đầu 2026.', 'Kể từ khi ra mắt vào năm 2021, Squid Game đã lập kỷ lục xem nhiều nhất mọi thời đại của Netflix và trở thành hiện tượng văn hóa toàn cầu. Việc liên tục giành giải tại các giải thưởng lớn bao gồm Emmy và Golden Globes đã nâng cao đáng kể uy tín của nội dung Hàn Quốc trên toàn thế giới.']
  },
  source: {
    ko: '연합뉴스',
    en: 'Yonhap News Agency',
    ja: '聯合ニュース',
    vi: 'Yonhap News Agency'
  },
  timeAgo: {
    ko: '5시간 전',
    en: '5h ago',
    ja: '5時間前',
    vi: '5 giờ trước'
  },
  image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop',
  likes: 6234,
  comments: 521
}, {
  id: 'a7',
  category: 'K-POP',
  categoryKey: 'kpop',
  categoryColor: 'bg-pink-500',
  categoryBg: 'from-pink-500 to-rose-600',
  title: {
    ko: '아이브 월드투어 전석 매진… 미국 5개 도시 추가 공연 확정',
    en: 'IVE World Tour Sells Out — 5 More US Cities Added',
    ja: 'IVEのワールドツアーが完売、米国5都市の追加公演が確定',
    vi: 'World tour của IVE cháy vé — Thêm 5 thành phố tại Mỹ'
  },
  body: {
    ko: ['그룹 아이브(IVE)가 진행 중인 첫 번째 월드투어 \'SHOW WHAT I HAVE\'의 미국 공연 전 회차가 매진된 가운데, 현지 프로모터의 요청으로 5개 도시에 추가 공연이 확정됐다. 미국 내 총 12개 도시, 18회 공연이라는 K팝 걸그룹 역대 최다 미국 단독 투어 기록에 도전한다.', '아이브의 소속사 스타쉽엔터테인먼트 측은 "현지 팬들의 폭발적인 수요에 감사하다"며 "최선을 다해 더 많은 팬들에게 최고의 무대를 선보이겠다"고 밝혔다. 미국 매출만 추산해도 300억 원을 넘길 것으로 업계는 전망하고 있다.', '아이브는 이번 투어에서 새 미니앨범 수록곡들을 중심으로 한 세트리스트를 공개, 강력한 무대 퍼포먼스와 화려한 무대 세트로 현지 언론의 극찬을 받았다. 미국 최대 음악 전문지 롤링스톤은 "K팝의 다음 세계적 스타"라는 제목의 특집 기사를 게재했다.', '이번 투어를 계기로 아이브의 글로벌 팬덤 \'다이브(DIVE)\'도 크게 성장하고 있다. 투어 기간 동안 공식 SNS 팔로워 수가 합산 500만 명 이상 증가했으며, 유튜브 구독자도 100만 명을 돌파해 빠르게 성장하고 있다.'],
    en: ['K-pop group IVE\'s first world tour \'SHOW WHAT I HAVE\' has completely sold out across all US dates, with 5 additional city shows confirmed at the request of local promoters. The group is now on track to challenge the record for most US solo tour dates by a K-pop girl group, with 18 shows across 12 cities.', 'Starship Entertainment stated, "We are deeply grateful for the explosive demand from local fans," adding that they would "do their best to showcase the best performances to even more fans." Industry estimates suggest US revenue alone will exceed 30 billion KRW.', 'IVE centered their setlist on songs from their latest mini-album, earning rave reviews from local press for powerful stage performances and elaborate stage sets. Rolling Stone, America\'s largest music publication, ran a feature titled "The Next World Stars of K-Pop."', 'The tour has also driven significant growth in IVE\'s global fandom \'DIVE\'. Combined official SNS followers grew by over 5 million during the tour period, and YouTube subscribers surpassed 100 million, continuing to grow rapidly.'],
    ja: ['K-POPグループIVEが進行中の初ワールドツアー「SHOW WHAT I HAVE」の米国公演が全公演即完売となる中、現地プロモーターの要請で5都市の追加公演が確定した。米国内12都市18公演というK-POPガールズグループ歴代最多米国単独ツアー記録に挑む。', 'IVEの所属事務所スターシップエンターテインメントは「現地ファンの爆発的な需要に感謝する」と述べ、「最善を尽くして多くのファンに最高のステージを届けたい」と明かした。米国での売上だけで300億ウォンを超えると業界は見込んでいる。', 'IVEは今ツアーで新ミニアルバムの楽曲を中心にセットリストを公開し、迫力のあるパフォーマンスと華やかなセットで現地メディアから絶賛された。米国最大の音楽専門誌ローリングストーンは「K-POPの次のワールドスター」と題した特集記事を掲載した。', '今ツアーを機にIVEのグローバルファンダム「DIVE」も大きく成長している。ツアー期間中に公式SNSのフォロワー数が合計500万人以上増加し、YouTubeチャンネル登録者数も100万人を突破した。'],
    vi: ['Nhóm nhạc K-pop IVE đang trong tour diễn đầu tiên toàn thế giới \'SHOW WHAT I HAVE\' đã cháy vé toàn bộ các buổi tại Mỹ, với 5 thành phố bổ sung được xác nhận theo yêu cầu của các promoter địa phương. Nhóm hiện đang trên đà phá kỷ lục số buổi diễn solo tại Mỹ của nhóm nhạc nữ K-pop, với 18 show ở 12 thành phố.', 'Starship Entertainment cho biết: "Chúng tôi vô cùng biết ơn trước nhu cầu bùng nổ từ người hâm mộ địa phương" và "sẽ cố hết sức để mang đến màn trình diễn tốt nhất cho nhiều fan hơn." Ước tính doanh thu tại Mỹ sẽ vượt 30 tỷ KRW.', 'IVE tập trung setlist vào các bài hát từ mini-album mới nhất, nhận được đánh giá tuyệt vời từ báo chí địa phương vì màn trình diễn mạnh mẽ và sân khấu hoành tráng. Rolling Stone, ấn phẩm âm nhạc lớn nhất nước Mỹ, đã đăng bài đặc biệt với tiêu đề "Ngôi sao toàn cầu tiếp theo của K-Pop."', 'Tour diễn cũng thúc đẩy sự phát triển đáng kể của fandom toàn cầu \'DIVE\' của IVE. Tổng số người theo dõi SNS chính thức tăng hơn 5 triệu trong thời gian tour, và người đăng ký YouTube vượt 1 triệu, tiếp tục tăng trưởng nhanh chóng.']
  },
  source: {
    ko: 'MBC',
    en: 'MBC',
    ja: 'MBC',
    vi: 'MBC'
  },
  timeAgo: {
    ko: '4시간 전',
    en: '4h ago',
    ja: '4時間前',
    vi: '4 giờ trước'
  },
  image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=500&fit=crop',
  likes: 3891,
  comments: 276
}, {
  id: 'a8',
  category: 'K-FOOD',
  categoryKey: 'kfood',
  categoryColor: 'bg-orange-500',
  categoryBg: 'from-orange-500 to-red-500',
  title: {
    ko: '한국 치킨 프랜차이즈, 미국 뉴욕·LA 동시 상륙… 현지 반응 폭발적',
    en: 'Korean Fried Chicken Chains Land in NYC & LA Simultaneously — Local Response Explosive',
    ja: '韓国フライドチキンフランチャイズ、ニューヨーク・LAに同時上陸、現地反応が爆発的',
    vi: 'Chuỗi gà rán Hàn Quốc đổ bộ NYC & LA cùng lúc — Phản ứng địa phương bùng nổ'
  },
  body: {
    ko: ['교촌치킨과 bhc치킨이 각각 뉴욕과 로스앤젤레스에 미국 첫 매장을 동시 오픈하며 K-푸드 열풍의 새로운 장을 열었다. 두 매장 모두 오픈 첫 날 수백 명의 줄이 이어지는 진풍경을 연출했으며, 소셜미디어에서도 큰 화제가 됐다.', '뉴욕 맨해튼 타임스스퀘어 인근에 문을 연 교촌치킨 뉴욕 1호점에는 개점 전날 밤부터 자리를 잡은 팬들이 있을 정도였다. 현지 언론들은 "뉴욕에 K-팝 콘서트장과 같은 열기가 치킨 가게 앞에 펼쳐졌다"고 보도했다.', '한국식 프라이드치킨은 얇고 바삭한 반죽, 다양한 소스 선택지, 마늘과 간장을 활용한 독특한 풍미가 미국 소비자들의 입맛을 사로잡고 있다. 뉴욕타임스 푸드 섹션은 "한국 치킨은 미국 치킨의 미래"라는 제목의 리뷰를 게재했다.', '업계에서는 이번 진출을 계기로 향후 5년 내 미국 전역에 한국 치킨 프랜차이즈 100개 매장 시대가 열릴 것으로 전망하고 있다. 국내 치킨 업계는 배달 문화와 결합한 한국만의 독특한 치킨 문화가 미국에서도 충분히 통할 것이라는 자신감을 보이고 있다.'],
    en: ['Kyochon Chicken and bhc Chicken simultaneously opened their first US stores in New York and Los Angeles respectively, marking a new chapter in the K-Food wave. Both stores drew hundreds of people in line on opening day, generating major buzz on social media.', 'Fans were queuing overnight before the opening of Kyochon\'s first New York location near Times Square in Manhattan. Local media reported, "The heat of a K-pop concert hall has unfolded in front of a chicken restaurant in New York."', 'Korean-style fried chicken is winning over American consumers with its thin crispy batter, wide variety of sauce options, and distinctive flavors using garlic and soy sauce. The New York Times food section published a review titled "Korean Chicken Is the Future of American Chicken."', 'Industry experts forecast that this market entry could open the era of 100 Korean fried chicken franchise locations across the US within the next five years. The Korean chicken industry is confident that the unique chicken culture combined with delivery culture will resonate strongly in America.'],
    ja: ['教村チキンとbhcチキンがそれぞれニューヨークとロサンゼルスに米国初出店を同時オープンし、K-フードブームの新たな幕を開けた。両店とも初日から数百人の行列ができる光景が見られ、ソーシャルメディアでも大きな話題となった。', 'マンハッタンのタイムズスクエア近くにオープンした교촌チキンのニューヨーク1号店には、前夜から並んでいたファンがいたほどだった。現地メディアは「ニューヨークでK-POPコンサート会場のような熱気がチキン店の前に広がった」と報じた。', '韓国式フライドチキンは薄くてサクサクした衣、豊富なソースの選択肢、にんにくと醤油を使った独特の風味でアメリカの消費者を虜にしている。ニューヨーク・タイムズのフードセクションは「韓国チキンはアメリカのチキンの未来だ」というタイトルのレビューを掲載した。', '業界では、この進出を機に今後5年以内に米国全土で韓国チキンフランチャイズ100店舗時代が到来すると予測している。国内チキン業界はデリバリー文化と組み合わせた韓国独自のチキン文化がアメリカでも十分に通用するという自信を見せている。'],
    vi: ['Kyochon Chicken và bhc Chicken đồng thời khai trương cửa hàng đầu tiên tại Mỹ ở New York và Los Angeles, đánh dấu một chương mới trong làn sóng K-Food. Cả hai cửa hàng đều thu hút hàng trăm người xếp hàng ngay ngày đầu tiên, tạo ra cơn sốt lớn trên mạng xã hội.', 'Người hâm mộ đã xếp hàng qua đêm trước khi mở cửa hàng đầu tiên của Kyochon gần Times Square ở Manhattan. Báo chí địa phương đưa tin: "Nhiệt độ của một nhà hát K-pop đã xuất hiện trước một nhà hàng gà ở New York."', 'Gà rán kiểu Hàn Quốc đang chinh phục người tiêu dùng Mỹ với lớp bột mỏng giòn, nhiều lựa chọn sốt, và hương vị đặc trưng sử dụng tỏi và nước tương. Mục ẩm thực của New York Times đã đăng bài nhận xét với tiêu đề "Gà Hàn Quốc là tương lai của gà Mỹ."', 'Các chuyên gia trong ngành dự báo rằng việc thâm nhập thị trường này có thể mở ra kỷ nguyên 100 địa điểm nhượng quyền gà rán Hàn Quốc trên khắp nước Mỹ trong vòng năm năm tới. Ngành gà Hàn Quốc tự tin rằng văn hóa gà độc đáo kết hợp với văn hóa giao hàng sẽ tạo tiếng vang mạnh mẽ ở Mỹ.']
  },
  source: {
    ko: '한국경제',
    en: 'Korea Economic Daily',
    ja: '韓国経済新聞',
    vi: 'Korea Economic Daily'
  },
  timeAgo: {
    ko: '8시간 전',
    en: '8h ago',
    ja: '8時間前',
    vi: '8 giờ trước'
  },
  image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=800&h=500&fit=crop',
  likes: 2156,
  comments: 143
}, {
  id: 'a9',
  category: 'K-DRAMA',
  categoryKey: 'kdrama',
  categoryColor: 'bg-violet-500',
  categoryBg: 'from-violet-500 to-purple-700',
  title: {
    ko: '송중기 주연 신작 드라마, 촬영 현장 첫 포착… 유럽 로케이션 장관',
    en: 'Song Joong-ki\'s New Drama Spotted Filming in Europe — Breathtaking Location Revealed',
    ja: 'ソン・ジュンギ主演の新作ドラマ、ヨーロッパロケ初キャッチ、絶景ロケ地公開',
    vi: 'Phim mới của Song Joong-ki bị bắt gặp quay tại châu Âu — Hé lộ địa điểm tuyệt đẹp'
  },
  body: {
    ko: ['배우 송중기가 주연을 맡은 넷플릭스 신작 드라마의 유럽 촬영 현장이 팬들에 의해 포착되며 큰 관심을 모으고 있다. 이탈리아 로마와 피렌체를 배경으로 한 해당 작품은 로맨스와 스릴러 요소를 결합한 장르물로 알려졌다.', '현지에서 포착된 비하인드 사진들이 SNS에 확산되며 팬들의 기대감이 폭발하고 있다. 피렌체 두오모 성당 앞에서 촬영한 장면과 로마의 콜로세움을 배경으로 한 장면들이 포함된 것으로 전해졌다.', '해당 드라마는 한국과 이탈리아의 문화가 교차하는 스토리를 담았으며, 이탈리아 현지 배우들과의 공동 출연이 이루어지는 것으로 알려졌다. 제작비만 총 500억 원에 달하는 초대형 프로젝트로, 넷플릭스 코리아 역대 최대 투자작이 될 전망이다.', '주연 배우 송중기는 제작 발표회에서 "유럽의 아름다운 배경 속에서 한국 배우가 이끌어가는 이야기를 담았다는 점에서 매우 의미 있는 작품"이라며 "시청자들이 지금껏 보지 못한 새로운 K-드라마의 모습을 보여드리겠다"고 밝혔다.'],
    en: ['The European filming locations for actor Song Joong-ki\'s new Netflix drama have been captured by fans, generating tremendous interest. Set in Rome and Florence, Italy, the work is described as a genre piece combining romance and thriller elements.', 'Behind-the-scenes photos circulating on social media have ignited fan anticipation. Shots reportedly include scenes filmed in front of Florence\'s Duomo Cathedral and against the backdrop of Rome\'s Colosseum.', 'The drama features a story where Korean and Italian cultures intersect, with Italian local actors reportedly joining the cast. The production budget reaches an astronomical 50 billion KRW, set to become the largest investment in Netflix Korea history.', 'Lead actor Song Joong-ki stated at a production press conference: "It\'s a very meaningful work in that it centers on a story led by a Korean actor against the beautiful backdrop of Europe," adding that he would "show viewers a new side of K-drama they\'ve never seen before."'],
    ja: ['ソン・ジュンギ主演のNetflix新作ドラマのヨーロッパ撮影現場がファンに捉えられ、大きな注目を集めている。イタリアのローマとフィレンツェを舞台にした本作は、ロマンスとスリラーの要素を組み合わせたジャンル作品として知られている。', '現地で撮影されたビハインドシーンがSNSで拡散し、ファンの期待が爆発している。フィレンツェのドゥオーモ大聖堂前での撮影シーンやローマのコロッセオを背景にしたシーンが含まれていると伝えられている。', '同ドラマは韓国とイタリアの文化が交差するストーリーを描き、イタリアの現地俳優との共演が行われるとされている。制作費だけで総500億ウォンに達する超大型プロジェクトで、Netflixコリア史上最大の投資作となる見通しだ。', '主演俳優のソン・ジュンギは制作発表会で「ヨーロッパの美しい背景の中で韓国俳優が主導するストーリーを描いたという点で非常に意義深い作品」と述べ、「視聴者がこれまで見たことのない新しいK-ドラマの姿をお見せする」と語った。'],
    vi: ['Địa điểm quay phim tại châu Âu của bộ phim Netflix mới của diễn viên Song Joong-ki đã được người hâm mộ ghi lại, tạo ra sự quan tâm lớn. Lấy bối cảnh Rome và Florence, Italy, tác phẩm được mô tả là thể loại kết hợp yếu tố lãng mạn và ly kỳ.', 'Những bức ảnh hậu trường lan truyền trên mạng xã hội đã thổi bùng sự mong chờ của người hâm mộ. Các cảnh được cho là bao gồm cảnh quay trước Nhà thờ Duomo ở Florence và bối cảnh Đấu trường La Mã ở Rome.', 'Bộ phim có câu chuyện giao thoa văn hóa Hàn Quốc và Ý, với các diễn viên địa phương Ý được cho là sẽ xuất hiện trong dàn cast. Ngân sách sản xuất đạt mức khổng lồ 50 tỷ KRW, dự kiến trở thành khoản đầu tư lớn nhất trong lịch sử Netflix Korea.', 'Diễn viên chính Song Joong-ki phát biểu tại họp báo sản xuất: "Đây là một tác phẩm rất có ý nghĩa vì nó tập trung vào câu chuyện do một diễn viên Hàn Quốc dẫn dắt trên nền cảnh châu Âu tuyệt đẹp," và thêm rằng anh sẽ "cho khán giả thấy một khía cạnh mới của K-drama mà họ chưa từng thấy trước đây."']
  },
  source: {
    ko: '조선일보',
    en: 'Chosun Ilbo',
    ja: '朝鮮日報',
    vi: 'Chosun Ilbo'
  },
  timeAgo: {
    ko: '10시간 전',
    en: '10h ago',
    ja: '10時間前',
    vi: '10 giờ trước'
  },
  image: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=800&h=500&fit=crop',
  likes: 4102,
  comments: 198
}, {
  id: 'a10',
  category: 'K-BEAUTY',
  categoryKey: 'kbeauty',
  categoryColor: 'bg-rose-400',
  categoryBg: 'from-rose-400 to-pink-600',
  title: {
    ko: '한국 남성 뷰티 시장 급성장… 그루밍 브랜드 세계 시장 점유율 20% 돌파',
    en: 'Korean Men\'s Beauty Market Surges — Grooming Brands Cross 20% Global Market Share',
    ja: '韓国メンズビューティー市場が急成長、グルーミングブランドが世界市場シェア20%突破',
    vi: 'Thị trường làm đẹp nam Hàn Quốc tăng vọt — Thương hiệu grooming vượt 20% thị phần toàn cầu'
  },
  body: {
    ko: ['K-뷰티의 성장세가 여성용 화장품을 넘어 남성 그루밍 시장까지 확산되고 있다. 대한화장품협회에 따르면 한국 남성 뷰티 제품의 글로벌 수출액이 전년 대비 62% 성장하며 세계 시장 점유율이 처음으로 20%를 돌파했다.', '특히 BB크림과 남성용 선크림, 기초 스킨케어 라인이 해외에서 인기를 끌고 있다. 전통적으로 화장품에 보수적이었던 미국·유럽 남성 소비자들이 K-뷰티 제품을 통해 처음으로 스킨케어에 입문하는 현상도 나타나고 있다.', '이 트렌드의 배경에는 K-팝 아이돌과 K-드라마 남자 주인공들의 영향이 크다는 분석이다. 빛나는 피부와 세련된 그루밍을 보여주는 K-콘텐츠가 전 세계 남성들에게 새로운 뷰티 기준을 제시하고 있다는 것이다.', '아모레퍼시픽의 남성 뷰티 브랜드 \'비레디\'는 올해만 미국 내 판매량이 전년 대비 3배 이상 증가했다. 해당 브랜드의 마케팅 책임자는 "K-드라마 주인공들의 피부 비결에 대한 관심이 실제 제품 구매로 이어지고 있다"고 설명했다.'],
    en: ['The growth of K-Beauty is expanding beyond women\'s cosmetics into the men\'s grooming market. According to the Korea Cosmetic Association, global exports of Korean men\'s beauty products grew 62% year-on-year, with world market share crossing 20% for the first time.', 'BB cream, men\'s sunscreen, and basic skincare lines in particular are gaining popularity overseas. An interesting phenomenon is emerging where American and European male consumers, traditionally conservative about cosmetics, are entering skincare for the first time through K-Beauty products.', 'Analysis suggests the background of this trend is largely driven by the influence of K-pop idols and K-drama male leads. K-content showcasing glowing skin and refined grooming is presenting new beauty standards to men worldwide.', 'AmorePacific\'s men\'s beauty brand \'b.ready\' saw US sales more than triple compared to the previous year in the current year alone. The brand\'s marketing director explained, "Interest in the skincare secrets of K-drama leads is translating into actual product purchases."'],
    ja: ['K-ビューティーの成長勢いが女性向け化粧品を超えて男性グルーミング市場にまで広がっている。大韓化粧品協会によると、韓国の男性向けビューティー製品のグローバル輸出額が前年比62%成長し、世界市場シェアが初めて20%を突破した。', '特にBBクリームや男性用サンクリーム、基礎スキンケアラインが海外で人気を集めている。化粧品に保守的だった米国・欧州の男性消費者がK-ビューティー製品を通じて初めてスキンケアに入門する現象も見られる。', 'このトレンドの背景にはK-POPアイドルやK-ドラマの男性主人公の影響が大きいという分析だ。輝く肌と洗練されたグルーミングを示すK-コンテンツが世界中の男性に新しいビューティー基準を提示しているという。', 'アモレパーシフィックの男性ビューティーブランド「b.ready」は今年だけで米国内販売量が前年比3倍以上増加した。同ブランドのマーケティング責任者は「K-ドラマ主人公の肌の秘訣への関心が実際の製品購入につながっている」と説明した。'],
    vi: ['Sự tăng trưởng của K-Beauty đang mở rộng ra ngoài mỹ phẩm phụ nữ sang thị trường chăm sóc sắc đẹp nam giới. Theo Hiệp hội Mỹ phẩm Hàn Quốc, xuất khẩu toàn cầu của sản phẩm làm đẹp nam Hàn Quốc tăng 62% so với cùng kỳ năm trước, với thị phần thế giới vượt 20% lần đầu tiên.', 'Kem BB, kem chống nắng cho nam và các dòng chăm sóc da cơ bản đặc biệt ngày càng được ưa chuộng ở nước ngoài. Một hiện tượng thú vị đang xuất hiện khi người tiêu dùng nam giới ở Mỹ và châu Âu, truyền thống bảo thủ về mỹ phẩm, đang bước vào chăm sóc da lần đầu tiên qua các sản phẩm K-Beauty.', 'Phân tích cho thấy xu hướng này phần lớn được thúc đẩy bởi ảnh hưởng của các idol K-pop và nhân vật nam chính K-drama. K-content thể hiện làn da sáng và grooming tinh tế đang trình bày tiêu chuẩn làm đẹp mới cho nam giới trên toàn thế giới.', 'Thương hiệu làm đẹp nam \'b.ready\' của AmorePacific chứng kiến doanh số tại Mỹ tăng gấp 3 lần so với năm trước chỉ trong năm nay. Giám đốc marketing của thương hiệu giải thích: "Sự quan tâm đến bí quyết làm đẹp của các nhân vật nam chính K-drama đang được chuyển thành mua hàng thực tế."']
  },
  source: {
    ko: '동아일보',
    en: 'Dong-A Ilbo',
    ja: '東亜日報',
    vi: 'Dong-A Ilbo'
  },
  timeAgo: {
    ko: '1일 전',
    en: '1d ago',
    ja: '1日前',
    vi: '1 ngày trước'
  },
  image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800&h=500&fit=crop',
  likes: 1843,
  comments: 89
}];
const COMMUNITY_THREADS: CommunityThread[] = [{
  id: 'th1',
  articleId: 'a1',
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
  topicTitle: {
    ko: '슈가 컴백, 이번 솔로 앨범 방향은?',
    en: "Suga's comeback — What direction for his solo album?",
    ja: 'SUGAのカムバック、ソロアルバムの方向性は？',
    vi: 'Suga trở lại — Album solo sẽ theo hướng nào?'
  },
  topicSummary: {
    ko: '힙합 감성 그대로? 아니면 더 따뜻하고 대중적인 팝으로? 여러분의 솔직한 바람을 들려주세요 💜',
    en: "Keep that raw hip-hop soul, or go warmer and more pop? Tell us what you're hoping for 💜",
    ja: 'ヒップホップそのまま？それとも温かくポップに？あなたの正直な気持ちを聞かせてください 💜',
    vi: 'Giữ hồn hip-hop? Hay ấm áp và pop hơn? Hãy chia sẻ mong muốn thật lòng của bạn 💜'
  },
  category: 'K-POP',
  categoryColor: 'bg-pink-500',
  commentCount: 312,
  likeCount: 4821,
  hotScore: 98,
  accentFrom: 'from-pink-500',
  accentTo: 'to-rose-600',
  comments: [{
    id: 'c1',
    user: 'minji_k',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    country: '🇰🇷',
    text: {
      ko: '어거스트 디 감성 그대로 가줬으면 좋겠어요. 그게 슈가의 진짜 색깔이라고 생각해요.',
      en: "I hope he keeps the Agust D vibe. That's the real Suga to me.",
      ja: 'Agust Dの雰囲気のままでいてほしい。',
      vi: 'Mình muốn anh ấy giữ nguyên hồn Agust D.'
    },
    timeAgo: '23분 전',
    likes: 214,
    replies: [{
      id: 'c1r1',
      user: 'army_global',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      country: '🇺🇸',
      text: {
        ko: '완전 동의해요! D-DAY 앨범이 너무 명반이라서 그 감성 이어갔으면 해요 🎵',
        en: 'Totally agree! D-DAY was a masterpiece, hope he continues that feel 🎵',
        ja: '全く同意！D-DAYは名盤なので、あの雰囲気を続けてほしい 🎵',
        vi: 'Đồng ý hoàn toàn! D-DAY là kiệt tác, mong anh ấy tiếp tục cảm giác đó 🎵'
      },
      timeAgo: '18분 전',
      likes: 87
    }, {
      id: 'c1r2',
      user: 'yoongi_fan_jp',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
      country: '🇯🇵',
      text: {
        ko: '근데 이번엔 좀 더 따뜻한 느낌이었으면 좋겠어요. 군대 다녀오면 사람이 달라진다잖아요 🥺',
        en: 'But I hope it feels warmer this time. They say people change after the military 🥺',
        ja: '今回はもっと温かみが欲しいな。軍隊から帰ると人が変わるって言うし 🥺',
        vi: 'Nhưng mình mong lần này ấm áp hơn. Người ta nói đi quân ngũ về thay đổi nhiều lắm 🥺'
      },
      timeAgo: '10분 전',
      likes: 43
    }]
  }, {
    id: 'c2',
    user: 'yuki_army',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
    country: '🇯🇵',
    text: {
      ko: '이번엔 좀 더 팝적인 접근을 해도 좋을 것 같아요.',
      en: 'A more pop-oriented approach would be nice this time.',
      ja: '今回はもう少しポップなアプローチも良いと思います。',
      vi: 'Lần này thử hướng pop hơn cũng hay đấy.'
    },
    timeAgo: '45분 전',
    likes: 87,
    replies: [{
      id: 'c2r1',
      user: 'kpop_brazil',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      country: '🇧🇷',
      text: {
        ko: '저도요! 글로벌 히트 만들어줬으면 해요. 브라질에서도 더 많이 알려지면 좋겠어요!',
        en: 'Me too! Hope he makes a global hit. Would love him to be more known in Brazil!',
        ja: '私も！グローバルヒットを作ってほしい。',
        vi: 'Mình cũng vậy! Mong anh ấy tạo hit toàn cầu để nổi tiếng hơn ở Brazil!'
      },
      timeAgo: '30분 전',
      likes: 29
    }]
  }, {
    id: 'c3',
    user: 'linh_bts',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    country: '🇻🇳',
    text: {
      ko: '군대에서 영감을 받은 곡이 있으면 좋겠어요.',
      en: "Hope there's a song inspired by his military experience.",
      ja: '軍隊での経験からインスピレーションを受けた曲があるといいですね。',
      vi: 'Hi vọng có bài hát lấy cảm hứng từ thời gian quân ngũ.'
    },
    timeAgo: '1시간 전',
    likes: 156
  }, {
    id: 'c8',
    user: 'suga_forever',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop',
    country: '🇰🇷',
    text: {
      ko: '어떤 장르든 슈가가 만들면 명곡이에요. 그냥 믿고 기다릴게요 💜',
      en: "Whatever genre it is, if Suga makes it, it'll be a masterpiece. Just trust and wait 💜",
      ja: 'どんなジャンルでもSUGAが作れば名曲。ただ信じて待ちます 💜',
      vi: 'Dù thể loại gì, Suga làm là kiệt tác. Cứ tin tưởng và chờ thôi 💜'
    },
    timeAgo: '2시간 전',
    likes: 392,
    replies: [{
      id: 'c8r1',
      user: 'army_7years',
      avatar: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=100&h=100&fit=crop',
      country: '🇰🇷',
      text: {
        ko: '아미 7년차로서 완전 공감해요 👏👏👏',
        en: 'As a 7-year ARMY I totally agree 👏👏👏',
        ja: '7年目ARMYとして完全に共感 👏👏👏',
        vi: 'Là fan 7 năm của ARMY, đồng ý hoàn toàn 👏👏👏'
      },
      timeAgo: '1시간 전',
      likes: 201
    }]
  }, {
    id: 'c9',
    user: 'music_critic_seoul',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    country: '🇰🇷',
    text: {
      ko: '업계 관계자 말로는 이번엔 프로듀서로서의 역량을 더 극대화한 앨범이 될 거라고 하더라고요. 기대됩니다.',
      en: 'Industry insiders say this album will maximize his abilities as a producer even more. Very excited.',
      ja: '業界関係者によると、今回はプロデューサーとしての能力をさらに最大化したアルバムになるとか。楽しみです。',
      vi: 'Người trong ngành nói album lần này sẽ tối đa hóa khả năng nhà sản xuất của anh ấy hơn nữa. Rất hồi hộp.'
    },
    timeAgo: '3시간 전',
    likes: 178
  }]
}, {
  id: 'th2',
  articleId: 'a2',
  image: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800&h=400&fit=crop',
  topicTitle: {
    ko: '《폭풍의 언덕》 한국판, 원작과 비교해서 어때요?',
    en: '"Storm on the Hill" — How does it compare to the original?',
    ja: '「嵐の丘」韓国版、原作と比べてどうですか？',
    vi: '"Đồi Bão Tố" bản Hàn — So với nguyên tác thì sao?'
  },
  topicSummary: {
    ko: '영국 소설을 한국 감성으로 녹여낸 이 작품, 여러분은 어떻게 보셨나요? 인상 깊었던 장면도 함께 나눠요 🎬',
    en: 'A British classic reimagined through a Korean lens — what was your reaction? Share that scene that stayed with you 🎬',
    ja: 'イギリスの名作を韓国の感性で描いた本作、どう感じましたか？心に残ったシーンも教えてください 🎬',
    vi: 'Kiệt tác Anh được tái hiện qua lăng kính Hàn Quốc — bạn cảm nhận thế nào? Chia sẻ cảnh ấn tượng nhất nào 🎬'
  },
  category: 'K-DRAMA',
  categoryColor: 'bg-violet-500',
  commentCount: 187,
  likeCount: 2340,
  hotScore: 84,
  accentFrom: 'from-violet-500',
  accentTo: 'to-purple-700',
  comments: [{
    id: 'c4',
    user: 'drama_fan',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    country: '🇺🇸',
    text: {
      ko: '원작보다 감정 표현이 훨씬 풍부해요. 한국 배우들의 연기력이 정말 빛나는 작품입니다.',
      en: 'The emotional depth is so much richer than the original. Korean actors really shine here.',
      ja: '感情表現が原作よりずっと豊かです。',
      vi: 'Chiều sâu cảm xúc phong phú hơn nguyên tác rất nhiều.'
    },
    timeAgo: '2시간 전',
    likes: 98,
    replies: [{
      id: 'c4r1',
      user: 'literature_lover',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
      country: '🇬🇧',
      text: {
        ko: '영국인으로서 원작 팬인데 한국판 보고 완전 놀랐어요. 이렇게 재해석이 가능한지 몰랐어요.',
        en: "As a Brit and original fan, I was completely blown away by the Korean version. Didn't know reinterpretation like this was possible.",
        ja: 'イギリス人として原作ファンですが、韓国版を見て驚きました。',
        vi: 'Là người Anh và là fan nguyên tác, tôi hoàn toàn bị choáng ngợp bởi bản Hàn.'
      },
      timeAgo: '1시간 전',
      likes: 67
    }]
  }, {
    id: 'c5',
    user: 'sakura_drama',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    country: '🇯🇵',
    text: {
      ko: '배경 음악이 정말 압권이에요. OST 전곡 다 들었는데 모두 명곡이에요.',
      en: 'The soundtrack is absolutely stunning. Every OST track is a masterpiece.',
      ja: 'BGMが本当に圧巻です。OST全曲聴きましたが、すべて名曲です。',
      vi: 'Nhạc nền thực sự ấn tượng. Mình đã nghe toàn bộ OST và từng bài đều là kiệt tác.'
    },
    timeAgo: '3시간 전',
    likes: 73
  }, {
    id: 'c10',
    user: 'paris_kdrama',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    country: '🇫🇷',
    text: {
      ko: '프랑스 문학 전공자인데, 원작의 핵심 주제를 한국 사회 맥락에 너무 자연스럽게 녹여냈어요. 박사 논문 쓰고 싶은 수준 😂',
      en: 'As a French Lit major, they integrated the core themes into Korean social context so naturally. PhD-thesis level stuff 😂',
      ja: 'フランス文学専攻ですが、原作の核心テーマを韓国社会の文脈に自然に溶け込ませています。博士論文が書けそうなレベル 😂',
      vi: 'Là sinh viên văn học Pháp, họ đã lồng ghép các chủ đề cốt lõi vào bối cảnh xã hội Hàn Quốc rất tự nhiên. Đủ để viết luận văn tiến sĩ 😂'
    },
    timeAgo: '5시간 전',
    likes: 241,
    replies: [{
      id: 'c10r1',
      user: 'kdrama_fan_kr',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      country: '🇰🇷',
      text: {
        ko: '외국 분이 이렇게 깊게 분석해주시다니 너무 감사해요 🙏',
        en: 'So grateful a foreigner analyzes it this deeply 🙏',
        ja: '外国の方がこんなに深く分析してくれて本当にありがとう 🙏',
        vi: 'Thật biết ơn khi người nước ngoài phân tích sâu sắc như vậy 🙏'
      },
      timeAgo: '4시간 전',
      likes: 88
    }, {
      id: 'c10r2',
      user: 'seoul_writer',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop',
      country: '🇰🇷',
      text: {
        ko: '실제로 작가 인터뷰에서 원작 텍스트를 수십 번 읽었다고 했어요. 그게 느껴지더라고요.',
        en: 'In the actual writer interview they said they read the original text dozens of times. You can feel it.',
        ja: '実際に脚本家のインタビューで原作を何十回も読んだと言っていました。それが伝わってきます。',
        vi: 'Trong phỏng vấn thực tế, biên kịch nói họ đã đọc nguyên tác hàng chục lần. Bạn có thể cảm nhận được điều đó.'
      },
      timeAgo: '3시간 전',
      likes: 112
    }]
  }, {
    id: 'c11',
    user: 'drama_binge_th',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
    country: '🇹🇭',
    text: {
      ko: '태국에서도 엄청 화제예요! 친구들이랑 매주 같이 보고 있는데 볼 때마다 토론이 2시간씩 돼요 😂',
      en: "It's hugely talked about in Thailand too! Watching with friends every week and we end up discussing for 2 hours each time 😂",
      ja: 'タイでも大きな話題です！毎週友達と一緒に見ていて、見るたびに2時間の議論になります 😂',
      vi: 'Ở Thái Lan cũng đang rất hot! Xem cùng bạn bè mỗi tuần và mỗi lần thảo luận đến 2 tiếng 😂'
    },
    timeAgo: '6시간 전',
    likes: 189
  }]
}, {
  id: 'th3',
  articleId: 'a3',
  image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&h=400&fit=crop',
  topicTitle: {
    ko: '한국 라면, 여러분 나라에서 얼마나 유명한가요?',
    en: 'How popular is Korean ramen in your country?',
    ja: '韓国ラーメン、皆さんの国ではどのくらい有名ですか？',
    vi: 'Mì Hàn Quốc phổ biến như thế nào ở đất nước bạn?'
  },
  topicSummary: {
    ko: '우리 나라에선 어떻게 즐겨 먹는지, 핫한 조합도 알려주세요! 같이 먹방 하는 느낌으로 🍜',
    en: "Tell us how you enjoy it in your country — and your favorite combo! Let's have a virtual mukbang together 🍜",
    ja: '各国での食べ方やおすすめの組み合わせを教えてください！みんなでバーチャル食レポしましょう 🍜',
    vi: 'Chia sẻ cách ăn và combo yêu thích ở đất nước bạn nhé! Cùng nhau mukbang ảo nào 🍜'
  },
  category: 'K-FOOD',
  categoryColor: 'bg-orange-500',
  commentCount: 94,
  likeCount: 1876,
  hotScore: 76,
  accentFrom: 'from-orange-400',
  accentTo: 'to-red-500',
  comments: [{
    id: 'c6',
    user: 'nguyen_foodie',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    country: '🇻🇳',
    text: {
      ko: '베트남에서 불닭볶음면이 완전히 대세예요!',
      en: "Buldak is absolutely huge in Vietnam!",
      ja: 'ベトナムでは辛ラーメンが完全に流行っています！',
      vi: 'Mì Buldak đang cực kỳ hot ở Việt Nam!'
    },
    timeAgo: '5시간 전',
    likes: 134,
    replies: [{
      id: 'c6r1',
      user: 'hanoi_fan',
      avatar: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=100&h=100&fit=crop',
      country: '🇻🇳',
      text: {
        ko: '베트남 여기도 불닭 품절 사태가 이미 여러 번 났어요ㅋㅋ',
        en: 'We\'ve already had several Buldak sold-out situations here in Vietnam lol',
        ja: 'ベトナムでもプルダックが何度も品切れになってます笑',
        vi: 'Ở Việt Nam đã có vài lần cháy hàng Buldak rồi đó kkk'
      },
      timeAgo: '4시간 전',
      likes: 56
    }]
  }, {
    id: 'c7',
    user: 'kenji_eats',
    avatar: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=100&h=100&fit=crop',
    country: '🇯🇵',
    text: {
      ko: '일본에서도 요즘 한국 라면 열풍이에요.',
      en: 'Korean ramen is trending big in Japan too.',
      ja: '日本でも最近韓国ラーメンブームです。',
      vi: 'Mì Hàn Quốc cũng đang bùng nổ ở Nhật.'
    },
    timeAgo: '7시간 전',
    likes: 89
  }, {
    id: 'c12',
    user: 'berlin_kfood',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    country: '🇩🇪',
    text: {
      ko: '독일 베를린 아시아 마트에서 신라면이 독일 인스턴트 라면보다 비싼데도 더 잘 팔려요. 진짜 신기해요.',
      en: 'In Berlin Asian markets, Shin Ramen sells better than German instant noodles even though it\'s more expensive. Truly amazing.',
      ja: 'ベルリンのアジアマートでは辛ラーメンがドイツのインスタントラーメンより高いのによく売れています。',
      vi: 'Ở chợ châu Á Berlin, Shin Ramen bán chạy hơn mì ăn liền Đức dù đắt hơn. Thật kỳ lạ.'
    },
    timeAgo: '9시간 전',
    likes: 213,
    replies: [{
      id: 'c12r1',
      user: 'munich_kpop',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
      country: '🇩🇪',
      text: {
        ko: '뮌헨도 같아요! K-팝 콘서트 줄 서듯 라면 사러 줄 서요 😂',
        en: 'Same in Munich! People queue for ramen like K-pop concert tickets 😂',
        ja: 'ミュンヘンも同じ！K-POPコンサートのようにラーメンを買うために並びます 😂',
        vi: 'Munich cũng vậy! Người ta xếp hàng mua mì như mua vé concert K-pop 😂'
      },
      timeAgo: '8시간 전',
      likes: 94
    }]
  }, {
    id: 'c13',
    user: 'sao_paulo_k',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    country: '🇧🇷',
    text: {
      ko: '브라질 상파울루에서는 한국 식품점 줄이 항상 길어요. 불닭은 SNS에서 챌린지로 유행 중이에요!',
      en: 'In São Paulo Brazil, Korean food stores always have long lines. Buldak is trending as a challenge on SNS!',
      ja: 'ブラジルのサンパウロでは韓国食品店の行列が常に長いです。プルダックはSNSでチャレンジとして流行中！',
      vi: 'Ở São Paulo Brazil, cửa hàng thực phẩm Hàn Quốc luôn có hàng dài. Buldak đang hot như thử thách trên MXH!'
    },
    timeAgo: '10시간 전',
    likes: 167
  }]
}];
const CATEGORY_CHIPS: {
  id: string;
  label: Record<Lang, string>;
}[] = [{
  id: 'all',
  label: {
    ko: '전체',
    en: 'All',
    ja: 'すべて',
    vi: 'Tất cả'
  }
}, {
  id: 'kpop',
  label: {
    ko: 'K-POP',
    en: 'K-POP',
    ja: 'K-POP',
    vi: 'K-POP'
  }
}, {
  id: 'kdrama',
  label: {
    ko: 'K-드라마',
    en: 'K-Drama',
    ja: 'K-ドラマ',
    vi: 'K-Drama'
  }
}, {
  id: 'kfood',
  label: {
    ko: 'K-푸드',
    en: 'K-Food',
    ja: 'K-フード',
    vi: 'K-Food'
  }
}, {
  id: 'kbeauty',
  label: {
    ko: 'K-뷰티',
    en: 'K-Beauty',
    ja: 'K-ビューティ',
    vi: 'K-Beauty'
  }
}];
const TRENDING_SEARCHES: {
  id: string;
  label: Record<Lang, string>;
}[] = [{
  id: 'ts1',
  label: {
    ko: 'BTS 슈가 컴백',
    en: 'BTS Suga comeback',
    ja: 'BTS SUGA カムバック',
    vi: 'BTS Suga trở lại'
  }
}, {
  id: 'ts2',
  label: {
    ko: '넷플릭스 한국 드라마',
    en: 'Netflix K-Drama',
    ja: 'Netflixの韓国ドラマ',
    vi: 'Phim Hàn Netflix'
  }
}, {
  id: 'ts3',
  label: {
    ko: '불닭볶음면 레시피',
    en: 'Buldak noodle recipe',
    ja: '辛ラーメン レシピ',
    vi: 'Công thức mì Buldak'
  }
}, {
  id: 'ts4',
  label: {
    ko: '유리 피부 만들기',
    en: 'Glass skin routine',
    ja: 'ガラス肌ルーティン',
    vi: 'Cách làm da thủy tinh'
  }
}];
const NOTIFICATIONS: NotificationItem[] = [{
  id: 'n1',
  type: 'like',
  avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
  message: {
    ko: 'minji_k 님이 회원님의 댓글을 좋아합니다.',
    en: 'minji_k liked your comment.',
    ja: 'minji_kさんがあなたのコメントにいいねしました。',
    vi: 'minji_k đã thích bình luận của bạn.'
  },
  timeAgo: '5분 전',
  isRead: false
}, {
  id: 'n2',
  type: 'comment',
  avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
  message: {
    ko: 'yuki_army 님이 슈가 스레드에 댓글을 남겼어요.',
    en: 'yuki_army commented on the Suga thread.',
    ja: 'yuki_armyさんがSUGAのスレッドにコメントしました。',
    vi: 'yuki_army đã bình luận trong chủ đề Suga.'
  },
  timeAgo: '23분 전',
  isRead: false
}, {
  id: 'n3',
  type: 'trending',
  avatar: '',
  message: {
    ko: '📈 "BTS 슈가 컴백" 토픽이 지금 핫해요!',
    en: '📈 "BTS Suga comeback" is trending right now!',
    ja: '📈「BTS SUGAカムバック」が今トレンドです！',
    vi: '📈 Chủ đề "BTS Suga trở lại" đang thịnh hành!'
  },
  timeAgo: '1시간 전',
  isRead: false
}, {
  id: 'n4',
  type: 'comment',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
  message: {
    ko: 'linh_bts 님이 회원님의 댓글에 답글을 달았어요.',
    en: 'linh_bts replied to your comment.',
    ja: 'linh_btsさんがあなたのコメントに返信しました。',
    vi: 'linh_bts đã trả lời bình luận của bạn.'
  },
  timeAgo: '2시간 전',
  isRead: true
}, {
  id: 'n5',
  type: 'like',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
  message: {
    ko: 'drama_fan 님 외 12명이 회원님의 게시글을 좋아합니다.',
    en: 'drama_fan and 12 others liked your post.',
    ja: 'drama_fanさん他12人があなたの投稿にいいねしました。',
    vi: 'drama_fan và 12 người khác đã thích bài của bạn.'
  },
  timeAgo: '3시간 전',
  isRead: true
}];
const RECENT_SEARCHES: {
  id: string;
  label: Record<Lang, string>;
}[] = [{
  id: 'rs4',
  label: {
    ko: 'K-BEAUTY',
    en: 'K-BEAUTY',
    ja: 'K-BEAUTY',
    vi: 'K-BEAUTY'
  }
}, {
  id: 'rs5',
  label: {
    ko: 'BLACKPINK 제니',
    en: 'BLACKPINK Jennie',
    ja: 'BLACKPINKジェニー',
    vi: 'BLACKPINK Jennie'
  }
}];
const MY_ACTIVITY: ActivityItem[] = [{
  id: 'act1',
  type: 'comment',
  articleId: 'a1',
  articleTitle: {
    ko: 'BTS 슈가, 군 복무 후 첫 공식 활동 재개…',
    en: 'BTS Suga Resumes Official Activities After Military Service…',
    ja: 'BTS SUGAが兵役後に初の公式活動を再開…',
    vi: 'Suga của BTS tái xuất sau nghĩa vụ quân sự…'
  },
  articleImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop',
  articleCategory: 'K-POP',
  articleCategoryColor: 'bg-pink-500',
  commentText: {
    ko: '어거스트 디 감성 그대로 가줬으면 해요!',
    en: 'Hope he keeps the Agust D energy!',
    ja: 'Agust Dのエネルギーを保ってほしい！',
    vi: 'Mong anh ấy giữ phong cách Agust D nhé!'
  },
  timeAgo: '23분 전',
  likeCount: 12
}, {
  id: 'act2',
  type: 'like',
  articleId: 'a2',
  articleTitle: {
    ko: '넷플릭스 오리지널 《폭풍의 언덕》 한국판…',
    en: 'Netflix Korean Original "Storm on the Hill"…',
    ja: 'Netflixオリジナル韓国版「嵐の丘」…',
    vi: 'Bản Hàn "Đồi Bão Tố" của Netflix…'
  },
  articleImage: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800&h=500&fit=crop',
  articleCategory: 'K-DRAMA',
  articleCategoryColor: 'bg-violet-500',
  commentText: {
    ko: '',
    en: '',
    ja: '',
    vi: ''
  },
  timeAgo: '3시간 전',
  likeCount: 0
}, {
  id: 'act3',
  type: 'comment',
  articleId: 'a3',
  articleTitle: {
    ko: '한국 라면, 유럽 수출액 역대 최고치 돌파…',
    en: 'Korean Ramen Exports to Europe Hit All-Time High…',
    ja: '韓国ラーメンの欧州輸出が過去最高を更新…',
    vi: 'Xuất khẩu mì Hàn Quốc sang châu Âu đạt mức kỷ lục…'
  },
  articleImage: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&h=500&fit=crop',
  articleCategory: 'K-FOOD',
  articleCategoryColor: 'bg-orange-500',
  commentText: {
    ko: '베트남에서도 한국 라면 정말 유행이에요! 😄',
    en: 'Korean ramen is super trendy in Vietnam too! 😄',
    ja: 'ベトナムでも韓国ラーメンが大流行！ 😄',
    vi: 'Mì Hàn Quốc cũng rất thịnh hành ở Việt Nam! 😄'
  },
  timeAgo: '6시간 전',
  likeCount: 8
}];
const ARTICLE_COMMENTS: Record<string, ArticleComment[]> = {
  a1: [{
    id: 'ac1',
    user: 'minji_k',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    country: '🇰🇷',
    text: {
      ko: '드디어 전역!! 아미로서 너무 설레요. 빨리 새 음악 듣고 싶다 😭💜',
      en: "Finally discharged!! So excited as an ARMY. Can't wait to hear new music 😭💜",
      ja: 'ついに除隊！ARMYとしてドキドキです。早く新しい音楽が聴きたい 😭💜',
      vi: 'Cuối cùng cũng xuất ngũ!! Hồi hộp quá á. Muốn nghe nhạc mới ngay 😭💜'
    },
    timeAgo: '23분 전',
    likes: 214,
    replies: [{
      id: 'ac1r1',
      user: 'global_army',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
      country: '🇺🇸',
      text: {
        ko: '저도요!!! 트위터에서 실시간으로 봤어요 🥹',
        en: 'Me too!!! Watched it live on Twitter 🥹',
        ja: '私も！！！Twitterでリアルタイムで見ました 🥹',
        vi: 'Mình cũng vậy!!! Xem trực tiếp trên Twitter 🥹'
      },
      timeAgo: '20분 전',
      likes: 89
    }]
  }, {
    id: 'ac2',
    user: 'yuki_army',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
    country: '🇯🇵',
    text: {
      ko: 'HYBE에서 솔로 프로젝트 확인했다니 진짜야?? 완전 기대된다ㅠㅠ',
      en: 'HYBE confirmed a solo project?? Is that real?? So hyped ㅠㅠ',
      ja: 'HYBEがソロプロジェクトを確認？！本当に？？めちゃくちゃ楽しみ ㅠㅠ',
      vi: 'HYBE xác nhận dự án solo thật không?? Hype quá trời luôn ㅠㅠ'
    },
    timeAgo: '45분 전',
    likes: 87,
    replies: [{
      id: 'ac2r1',
      user: 'news_check_kr',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      country: '🇰🇷',
      text: {
        ko: '공식 발표 맞아요! 한경 기사에도 나왔어요 📰',
        en: "It's official! It was also in the Hankook newspaper 📰",
        ja: '公式発表です！韓経の記事にも載っていました 📰',
        vi: 'Đúng là chính thức rồi! Có trên báo Hankook luôn 📰'
      },
      timeAgo: '38분 전',
      likes: 45
    }]
  }, {
    id: 'ac3',
    user: 'linh_bts',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    country: '🇻🇳',
    text: {
      ko: '군대 경험이 음악에 어떻게 녹아들지 너무 궁금해요. 분명 더 깊어진 가사가 나올 것 같아요 🎵',
      en: 'So curious how his military experience will reflect in the music. The lyrics will definitely be deeper 🎵',
      ja: '軍隊の経験が音楽にどう反映されるか気になります。より深い歌詞が出てくるはず 🎵',
      vi: 'Tò mò xem trải nghiệm quân sự sẽ thể hiện trong âm nhạc thế nào. Lời bài hát chắc chắn sâu sắc hơn 🎵'
    },
    timeAgo: '1시간 전',
    likes: 156
  }, {
    id: 'ac10',
    user: 'army_jiyeon',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop',
    country: '🇰🇷',
    text: {
      ko: '슈가가 전역하는 날 진짜 눈물 났어요ㅠ 이제 다시 음악 들을 수 있다는 게 너무 행복해요 🎶',
      en: "I literally cried the day Suga was discharged ㅠ I'm so happy we can listen to his music again 🎶",
      ja: 'SUGAが除隊した日は本当に泣きました。また彼の音楽を聴けることが嬉しくて 🎶',
      vi: 'Tôi khóc thật sự vào ngày Suga xuất ngũ ㅠ Rất hạnh phúc khi có thể nghe nhạc của anh ấy trở lại 🎶'
    },
    timeAgo: '2시간 전',
    likes: 301,
    replies: [{
      id: 'ac10r1',
      user: 'bts_sister',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      country: '🇰🇷',
      text: {
        ko: '나도ㅠㅠ 같이 울었어요 진짜 💜',
        en: 'Me too ㅠㅠ cried together 💜',
        ja: '私もㅠㅠ一緒に泣きました 💜',
        vi: 'Mình cũng vậy ㅠㅠ khóc cùng nhau 💜'
      },
      timeAgo: '1시간 전',
      likes: 134
    }]
  }],
  a2: [{
    id: 'ac4',
    user: 'drama_fan',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    country: '🇺🇸',
    text: {
      ko: '3화까지 봤는데 이미 명작이에요. 한국 드라마가 왜 세계를 사로잡는지 알 것 같아요.',
      en: "Watched 3 episodes and it's already a masterpiece. I understand why K-dramas captivate the world.",
      ja: '3話まで見ましたが、もう名作です。韓国ドラマがなぜ世界を魅了するのかわかります。',
      vi: 'Đã xem đến tập 3 và đây đã là kiệt tác rồi. Hiểu tại sao phim Hàn chinh phục thế giới.'
    },
    timeAgo: '2시간 전',
    likes: 98,
    replies: [{
      id: 'ac4r1',
      user: 'ny_kdrama',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
      country: '🇺🇸',
      text: {
        ko: '뉴욕에서도 오피스 동료들이랑 같이 보고 있어요! 완전 중독성 있어요.',
        en: 'Watching with my NYC office colleagues too! Totally addictive.',
        ja: 'NYCのオフィスの同僚とも一緒に見ています！完全に中毒性があります。',
        vi: 'Đang xem cùng đồng nghiệp văn phòng ở NYC! Nghiện hoàn toàn.'
      },
      timeAgo: '1시간 전',
      likes: 43
    }]
  }, {
    id: 'ac5',
    user: 'sakura_drama',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    country: '🇯🇵',
    text: {
      ko: 'OST 진짜 미쳤어요. 1화 엔딩 곡에서 눈물이 절로 나더라고요 😢',
      en: 'The OST is insane. The ending song of episode 1 had me in tears 😢',
      ja: 'OSTが本当にやばい。1話のエンディング曲で自然と涙が出てきました 😢',
      vi: 'OST hay điên luôn. Nhạc kết thúc tập 1 làm mình khóc không kịp 😢'
    },
    timeAgo: '3시간 전',
    likes: 73
  }, {
    id: 'ac11',
    user: 'kdrama_claire',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    country: '🇫🇷',
    text: {
      ko: '에밀리 브론테 원작을 이렇게 재해석할 줄은 몰랐어요. 한국의 미가 정말 아름답게 표현됐네요.',
      en: "I didn't expect such a reinterpretation of Emily Brontë. Korean aesthetics are expressed so beautifully.",
      ja: 'エミリー・ブロンテの原作をこう再解釈するとは思いませんでした。韓国の美しさが本当に美しく表現されています。',
      vi: 'Tôi không ngờ lại có cách tái diễn giải Emily Brontë như vậy. Vẻ đẹp Hàn Quốc được thể hiện thật đẹp.'
    },
    timeAgo: '5시간 전',
    likes: 142,
    replies: [{
      id: 'ac11r1',
      user: 'french_lit',
      avatar: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=100&h=100&fit=crop',
      country: '🇫🇷',
      text: {
        ko: '완전 공감해요! 유럽 고전을 이렇게 소화하는 K-드라마 진짜 대단하다고 생각해요.',
        en: 'Totally agree! K-dramas that can absorb European classics like this are truly impressive.',
        ja: '全く同感！ヨーロッパの古典をこう消化するK-ドラマは本当に凄いと思います。',
        vi: 'Đồng ý hoàn toàn! K-drama có thể tiêu hóa các tác phẩm cổ điển châu Âu như vậy thật ấn tượng.'
      },
      timeAgo: '4시간 전',
      likes: 67
    }]
  }],
  a3: [{
    id: 'ac6',
    user: 'nguyen_foodie',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    country: '🇻🇳',
    text: {
      ko: '베트남 편의점에 불닭 3단 메뉴가 따로 있을 정도예요ㅋㅋ 진짜 국민 라면 됐어요',
      en: "There's literally a dedicated Buldak section in Vietnamese convenience stores lol. It's become a national noodle.",
      ja: 'ベトナムのコンビニには専用のプルダックコーナーがあるくらいですww 本当に国民的ラーメンになりました',
      vi: 'Ở Việt Nam có góc riêng cho Buldak trong cửa hàng tiện lợi luôn á kkk. Thật sự thành mì quốc dân rồi'
    },
    timeAgo: '5시간 전',
    likes: 134
  }, {
    id: 'ac7',
    user: 'kenji_eats',
    avatar: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=100&h=100&fit=crop',
    country: '🇯🇵',
    text: {
      ko: '유럽 친구한테 선물로 보냈더니 완전 빠져버렸대요ㅋㅋㅋ K-푸드 외교관이 된 기분',
      en: "Sent it to my European friend and they're obsessed lol K-food diplomat vibes",
      ja: 'ヨーロッパの友人へのお土産で送ったら完全にハマったってwww K-フード外交官になった気分',
      vi: 'Gửi tặng bạn châu Âu rồi họ ghiền luôn kkk Cảm giác như đại sứ K-Food vậy'
    },
    timeAgo: '7시간 전',
    likes: 89,
    replies: [{
      id: 'ac7r1',
      user: 'eu_kfan',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
      country: '🇩🇪',
      text: {
        ko: '저 그 유럽 친구인가요ㅋㅋㅋ 저도 선물로 받고 완전 빠졌어요!',
        en: 'Am I that European friend lol I also got it as a gift and got totally hooked!',
        ja: '私がそのヨーロッパの友達ですか笑 私もプレゼントでもらって完全にハマりました！',
        vi: 'Tôi có phải người bạn châu Âu đó không kkk Mình cũng nhận được quà và ghiền hoàn toàn!'
      },
      timeAgo: '6시간 전',
      likes: 201
    }]
  }, {
    id: 'ac12',
    user: 'paris_foodie',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop',
    country: '🇫🇷',
    text: {
      ko: '파리 카르푸에 실제로 K-누들존 생겼는지 가서 확인해봤는데 진짜더라구요!! 신기했어요',
      en: 'I actually went to check if a K-Noodle Zone opened at Carrefour Paris — and it was real!! So surreal.',
      ja: 'パリのカルフールにK-ヌードルゾーンが本当にできたか確認しに行ったら本当でした！！不思議な気分でした',
      vi: 'Tôi thực sự đã đến kiểm tra xem K-Noodle Zone có mở tại Carrefour Paris không — và có thật!! Thật kỳ lạ.'
    },
    timeAgo: '9시간 전',
    likes: 211
  }],
  a4: [{
    id: 'ac8',
    user: 'beauty_jini',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    country: '🇰🇷',
    text: {
      ko: '유리피부 루틴 6개월 째 하고 있는데 진짜 피부가 달라졌어요. K-뷰티 믿음 확고합니다 ✨',
      en: 'Been doing the glass skin routine for 6 months and my skin is genuinely transformed. Full trust in K-Beauty ✨',
      ja: 'ガラス肌ルーティンを6ヶ月続けていますが、本当に肌が変わりました。',
      vi: 'Đã làm routine da thủy tinh 6 tháng và da thật sự thay đổi. Hoàn toàn tin tưởng K-Beauty ✨'
    },
    timeAgo: '30분 전',
    likes: 201,
    replies: [{
      id: 'ac8r1',
      user: 'skincare_addict',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      country: '🇺🇸',
      text: {
        ko: '어떤 제품 쓰세요? 추천해주시면 감사해요!',
        en: 'What products do you use? Would appreciate recommendations!',
        ja: 'どんな製品を使っていますか？おすすめを教えてください！',
        vi: 'Bạn dùng sản phẩm gì vậy? Rất biết ơn nếu bạn giới thiệu!'
      },
      timeAgo: '20분 전',
      likes: 56
    }]
  }, {
    id: 'ac9',
    user: 'claire_beauty',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop',
    country: '🇺🇸',
    text: {
      ko: '세포라에서 한국 브랜드 코너가 이렇게 커진 게 실감이 안 나요. 얼타에서도 팔아요!',
      en: "The Korean brand section at Sephora has grown so much, it's surreal. They sell it at Ulta too!",
      ja: 'セフォラでの韓国ブランドコーナーがこんなに大きくなるとは信じられません。アルタでも売ってます！',
      vi: 'Góc thương hiệu Hàn tại Sephora to lên không ngờ luôn. Cả Ulta cũng bán rồi!'
    },
    timeAgo: '2시간 전',
    likes: 66
  }],
  a5: [{
    id: 'ac13',
    user: 'jennie_world',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    country: '🇰🇷',
    text: {
      ko: '마크 롤슨이랑 협업이라니 진짜 기대 터져요!! 어떤 장르가 나올지 너무 궁금하다 🎵',
      en: "A collab with Mark Ronson?? My expectations are through the roof!! I'm dying to know what genre it'll be 🎵",
      ja: 'マーク・ロンソンとのコラボとは本当に期待が爆発します！どんなジャンルになるか本当に気になる 🎵',
      vi: 'Hợp tác với Mark Ronson?? Kỳ vọng tôi đang bay lên mây!! Muốn biết sẽ là thể loại gì 🎵'
    },
    timeAgo: '1시간 전',
    likes: 445,
    replies: [{
      id: 'ac13r1',
      user: 'music_nerd',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
      country: '🇺🇸',
      text: {
        ko: '마크 롤슨은 업타운 펑크 만든 그 프로듀서잖아요. 조합이 실화야??',
        en: "Mark Ronson is the Uptown Funk producer right?? This collab is for real??",
        ja: 'マーク・ロンソンってアップタウン・ファンクを作ったプロデューサーでしょ。このコラボが本当に？？',
        vi: 'Mark Ronson là nhà sản xuất của Uptown Funk phải không?? Sự kết hợp này có thật không??'
      },
      timeAgo: '50분 전',
      likes: 187
    }, {
      id: 'ac13r2',
      user: 'blink_thai',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
      country: '🇹🇭',
      text: {
        ko: '태국 BLINK들도 다 난리났어요. 이건 진짜 역대급 될 것 같아요!',
        en: 'Thai BLINKs are all going crazy too. This feels like it could be legendary!',
        ja: 'タイのBLINKも大騒ぎです。これは本当に歴史的になりそう！',
        vi: 'BLINK Thái Lan cũng đang điên hết cả. Cái này có thể trở thành huyền thoại!'
      },
      timeAgo: '40분 전',
      likes: 134
    }]
  }, {
    id: 'ac14',
    user: 'blink_mia',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    country: '🇺🇸',
    text: {
      ko: '15초 클립만 봤는데 이미 완전히 빠졌어요. 제니는 항상 기대를 뛰어넘는다구요 😍',
      en: "Watched just 15 seconds and I'm already completely hooked. Jennie always exceeds expectations 😍",
      ja: '15秒のクリップだけで完全にハマりました。ジェニーはいつも期待を超えてくる 😍',
      vi: 'Chỉ xem 15 giây thôi mà đã hoàn toàn bị cuốn hút rồi. Jennie luôn vượt qua mọi kỳ vọng 😍'
    },
    timeAgo: '3시간 전',
    likes: 287
  }, {
    id: 'ac15',
    user: 'kpop_germany',
    avatar: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=100&h=100&fit=crop',
    country: '🇩🇪',
    text: {
      ko: '제니 솔로 2집 나오면 바로 스트리밍 1위 찍을 것 같아요. 팬덤 파워 진짜 대단하거든요!',
      en: "Jennie's solo album 2 will hit #1 streaming immediately when it drops. The fandom power is truly incredible!",
      ja: 'ジェニーのソロ2ndが出たらすぐストリーミング1位になりそう。ファンダムのパワーが本当にすごい！',
      vi: 'Album solo 2 của Jennie ra mắt là sẽ lên #1 streaming ngay lập tức. Sức mạnh fandom thực sự đáng kinh ngạc!'
    },
    timeAgo: '4시간 전',
    likes: 178
  }],
  a6: [{
    id: 'ac16',
    user: 'squid_fan_kr',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop',
    country: '🇰🇷',
    text: {
      ko: '시즌2 결말이 충격적이어서 시즌3 어떻게 이어질지 진짜 궁금해요. 기훈이 어떻게 될지…',
      en: "The Season 2 ending was so shocking, I'm desperate to know how Season 3 continues. What will happen to Gi-hun…",
      ja: 'シーズン2の結末が衝撃的でシーズン3がどう続くか本当に気になります。ギフンがどうなるか…',
      vi: 'Kết thúc Season 2 quá sốc, tôi tò mò vô cùng xem Season 3 sẽ tiếp diễn thế nào. Gi-hun sẽ ra sao…'
    },
    timeAgo: '1시간 전',
    likes: 523,
    replies: [{
      id: 'ac16r1',
      user: 'theory_master',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
      country: '🇰🇷',
      text: {
        ko: '시즌2에서 나온 복선들 다 분석했는데 기훈이 결국 게임 설계자가 될 것 같아요!!',
        en: 'Analyzed all the foreshadowing from Season 2 and I think Gi-hun will ultimately become the game designer!!',
        ja: 'シーズン2の伏線を全て分析しましたが、ギフンが最終的にゲームデザイナーになると思います！！',
        vi: 'Đã phân tích tất cả các chi tiết báo trước từ Season 2 và tôi nghĩ Gi-hun cuối cùng sẽ trở thành người thiết kế trò chơi!!'
      },
      timeAgo: '45분 전',
      likes: 312
    }, {
      id: 'ac16r2',
      user: 'spoiler_free',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
      country: '🇺🇸',
      text: {
        ko: '스포 조심해요!! 저 아직 시즌2 다 못 봤어요 😭',
        en: 'Spoiler warning!! I haven\'t finished Season 2 yet 😭',
        ja: 'ネタバレ注意！！まだシーズン2見終わってないんです 😭',
        vi: 'Cảnh báo spoiler!! Tôi chưa xem xong Season 2 😭'
      },
      timeAgo: '30분 전',
      likes: 89
    }]
  }, {
    id: 'ac17',
    user: 'hwang_fan',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop',
    country: '🇺🇸',
    text: {
      ko: '황동혁 감독이 약속한 "최고의 엔딩"이 너무 기대돼요. 믿고 기다릴게요!',
      en: 'So excited for the "best ending" Director Hwang promised. I\'ll be waiting with trust!',
      ja: 'ファン監督が約束した「最高のエンディング」が楽しみすぎます。信じて待ちます！',
      vi: 'Quá hóng "kết thúc hay nhất" mà Đạo diễn Hwang đã hứa. Tôi sẽ chờ đợi với niềm tin!'
    },
    timeAgo: '2시간 전',
    likes: 381
  }, {
    id: 'ac18',
    user: 'kontent_king',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
    country: '🇬🇧',
    text: {
      ko: '오징어게임이 한국 콘텐츠의 위상을 얼마나 높였는지 새삼 실감해요. 진짜 문화 혁명이었어요.',
      en: "It hits me again how much Squid Game elevated Korean content's global prestige. It truly was a cultural revolution.",
      ja: 'イカゲームが韓国コンテンツの地位をどれほど高めたか改めて実感します。本当に文化革命でした。',
      vi: 'Lại cảm nhận được Squid Game đã nâng cao vị thế nội dung Hàn Quốc đến mức nào. Thực sự là một cuộc cách mạng văn hóa.'
    },
    timeAgo: '6시간 전',
    likes: 294,
    replies: [{
      id: 'ac18r1',
      user: 'global_media',
      avatar: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=100&h=100&fit=crop',
      country: '🇦🇺',
      text: {
        ko: '호주에서도 오징어게임 이후로 K-드라마 팬이 폭발적으로 늘었어요!',
        en: 'In Australia too, K-drama fans exploded after Squid Game!',
        ja: 'オーストラリアでもイカゲーム以降K-ドラマファンが爆発的に増えました！',
        vi: 'Ở Úc cũng vậy, fans K-drama bùng nổ sau Squid Game!'
      },
      timeAgo: '4시간 전',
      likes: 156
    }]
  }]
};
// --- Community Quick Cards Data ---
type CommunityQuickCardItem = {
  id: string;
  label: Record<Lang, string>;
  value?: string;
  image?: string;
  percent?: number;
  votes?: number;
};
type CommunityQuickCardSection = {
  id: string;
  type: 'poll' | 'ranking' | 'photos' | 'discussion';
  title: Record<Lang, string>;
  items: CommunityQuickCardItem[];
};
type CommunityQuickCard = {
  id: string;
  type: 'challenge' | 'hottopic' | 'playlist' | 'horoscope';
  emoji: string;
  image: string;
  gradientFrom: string;
  gradientTo: string;
  title: Record<Lang, string>;
  subtitle: Record<Lang, string>;
  detail: {
    headerImage: string;
    sections: CommunityQuickCardSection[];
  };
};
const COMMUNITY_QUICK_CARDS: CommunityQuickCard[] = [{
  id: 'qc1',
  type: 'challenge',
  emoji: '🔥',
  image: 'https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=400&h=300&fit=crop',
  gradientFrom: 'from-orange-500',
  gradientTo: 'to-pink-600',
  title: {
    ko: '이번 주 챌린지',
    en: 'This Week\'s Challenge',
    ja: '今週のチャレンジ',
    vi: 'Thử thách tuần này'
  },
  subtitle: {
    ko: '불닭 2배맵 먹방',
    en: '2x Buldak Mukbang',
    ja: '2倍激辛プルダック',
    vi: 'Ăn Buldak 2x Cay'
  },
  detail: {
    headerImage: 'https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800&h=400&fit=crop',
    sections: [{
      id: 's1',
      type: 'poll',
      title: {
        ko: '도전해봤나요?',
        en: 'Have you tried it?',
        ja: '挑戦しましたか？',
        vi: 'Bạn đã thử chưa?'
      },
      items: [{
        id: 'p1',
        label: {
          ko: '🔥 완주했어요!',
          en: '🔥 Crushed it!',
          ja: '🔥 完走しました！',
          vi: '🔥 Hoàn thành rồi!'
        },
        percent: 34,
        votes: 1204
      }, {
        id: 'p2',
        label: {
          ko: '😅 절반만 먹었어요',
          en: '😅 Ate half',
          ja: '😅 半分だけ食べました',
          vi: '😅 Ăn được nửa thôi'
        },
        percent: 41,
        votes: 1453
      }, {
        id: 'p3',
        label: {
          ko: '😱 포기했어요',
          en: '😱 Gave up',
          ja: '😱 諦めました',
          vi: '😱 Bỏ cuộc rồi'
        },
        percent: 25,
        votes: 889
      }]
    }, {
      id: 's2',
      type: 'ranking',
      title: {
        ko: '이번 주 챌린저 TOP 3',
        en: 'Top 3 Challengers',
        ja: '今週のチャレンジャーTOP3',
        vi: 'Top 3 người thử thách'
      },
      items: [{
        id: 'r1',
        label: {
          ko: 'buldak_queen 🇰🇷',
          en: 'buldak_queen 🇰🇷',
          ja: 'buldak_queen 🇰🇷',
          vi: 'buldak_queen 🇰🇷'
        },
        value: '2:34',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop'
      }, {
        id: 'r2',
        label: {
          ko: 'spicy_mia 🇺🇸',
          en: 'spicy_mia 🇺🇸',
          ja: 'spicy_mia 🇺🇸',
          vi: 'spicy_mia 🇺🇸'
        },
        value: '3:12',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop'
      }, {
        id: 'r3',
        label: {
          ko: 'kenji_eats 🇯🇵',
          en: 'kenji_eats 🇯🇵',
          ja: 'kenji_eats 🇯🇵',
          vi: 'kenji_eats 🇯🇵'
        },
        value: '3:58',
        image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=80&h=80&fit=crop'
      }]
    }, {
      id: 's3',
      type: 'photos',
      title: {
        ko: '챌린지 인증샷',
        en: 'Challenge Shots',
        ja: 'チャレンジ認証ショット',
        vi: 'Ảnh thử thách'
      },
      items: [{
        id: 'ph1',
        label: {
          ko: '',
          en: '',
          ja: '',
          vi: ''
        },
        image: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=200&h=200&fit=crop'
      }, {
        id: 'ph2',
        label: {
          ko: '',
          en: '',
          ja: '',
          vi: ''
        },
        image: 'https://images.unsplash.com/photo-1562802378-063ec186a863?w=200&h=200&fit=crop'
      }, {
        id: 'ph3',
        label: {
          ko: '',
          en: '',
          ja: '',
          vi: ''
        },
        image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=200&h=200&fit=crop'
      }]
    }]
  }
}, {
  id: 'qc2',
  type: 'hottopic',
  emoji: '💬',
  image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400&h=300&fit=crop',
  gradientFrom: 'from-violet-600',
  gradientTo: 'to-blue-600',
  title: {
    ko: '핫한 토론',
    en: 'Hot Discussion',
    ja: '熱いトピック',
    vi: 'Thảo luận nóng'
  },
  subtitle: {
    ko: '아이브 vs 뉴진스',
    en: 'IVE vs NewJeans',
    ja: 'IVE vs NewJeans',
    vi: 'IVE vs NewJeans'
  },
  detail: {
    headerImage: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800&h=400&fit=crop',
    sections: [{
      id: 's1',
      type: 'poll',
      title: {
        ko: '지금 더 좋아하는 그룹은?',
        en: 'Which group do you prefer?',
        ja: '今どちらが好き？',
        vi: 'Nhóm nào bạn thích hơn?'
      },
      items: [{
        id: 'p1',
        label: {
          ko: '💜 아이브 (IVE)',
          en: '💜 IVE',
          ja: '💜 IVE',
          vi: '💜 IVE'
        },
        percent: 52,
        votes: 8341
      }, {
        id: 'p2',
        label: {
          ko: '🩵 뉴진스 (NewJeans)',
          en: '🩵 NewJeans',
          ja: '🩵 NewJeans',
          vi: '🩵 NewJeans'
        },
        percent: 48,
        votes: 7691
      }]
    }, {
      id: 's2',
      type: 'ranking',
      title: {
        ko: '최근 1주일 차트 성과',
        en: 'Chart Performance This Week',
        ja: '1週間のチャート成績',
        vi: 'Thành tích bảng xếp hạng'
      },
      items: [{
        id: 'r1',
        label: {
          ko: 'IVE — Accendio',
          en: 'IVE — Accendio',
          ja: 'IVE — Accendio',
          vi: 'IVE — Accendio'
        },
        value: '#1',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=80&h=80&fit=crop'
      }, {
        id: 'r2',
        label: {
          ko: 'NewJeans — Supernatural',
          en: 'NewJeans — Supernatural',
          ja: 'NewJeans — Supernatural',
          vi: 'NewJeans — Supernatural'
        },
        value: '#3',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop'
      }, {
        id: 'r3',
        label: {
          ko: 'IVE — Kitsch',
          en: 'IVE — Kitsch',
          ja: 'IVE — Kitsch',
          vi: 'IVE — Kitsch'
        },
        value: '#7',
        image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=80&h=80&fit=crop'
      }]
    }, {
      id: 's3',
      type: 'discussion',
      title: {
        ko: '팬들의 한마디',
        en: 'Fans Say',
        ja: 'ファンの一言',
        vi: 'Fan nói gì'
      },
      items: [{
        id: 'd1',
        label: {
          ko: '"아이브는 무대 퀄리티가 진짜 넘사벽 ✨" — dive_kr 🇰🇷',
          en: '"IVE\'s stage quality is unmatched ✨" — dive_kr 🇰🇷',
          ja: '"IVEのステージは別格 ✨" — dive_kr 🇰🇷',
          vi: '"Sân khấu IVE không ai sánh bằng ✨" — dive_kr 🇰🇷'
        },
        value: '↑ 412'
      }, {
        id: 'd2',
        label: {
          ko: '"뉴진스 감성은 그냥 중독 🩵" — bunny_fan 🇺🇸',
          en: '"NewJeans vibes are addictive 🩵" — bunny_fan 🇺🇸',
          ja: '"NewJeansは中毒性がある 🩵" — bunny_fan 🇺🇸',
          vi: '"Vibe NewJeans gây nghiện 🩵" — bunny_fan 🇺🇸'
        },
        value: '↑ 387'
      }, {
        id: 'd3',
        label: {
          ko: '"둘 다 좋아요~ 굳이 비교 말아요 😅" — peaceful_fan 🇯🇵',
          en: '"Both are great, no need to compare 😅" — peaceful_fan 🇯🇵',
          ja: '"両方好き、比べなくていいじゃん 😅" — peaceful_fan 🇯🇵',
          vi: '"Cả hai đều tuyệt, đừng so sánh 😅" — peaceful_fan 🇯🇵'
        },
        value: '↑ 291'
      }]
    }]
  }
}, {
  id: 'qc3',
  type: 'playlist',
  emoji: '🎧',
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
  gradientFrom: 'from-emerald-500',
  gradientTo: 'to-teal-600',
  title: {
    ko: '추천 플리',
    en: 'Curated Playlist',
    ja: 'おすすめプレイリスト',
    vi: 'Playlist gợi ý'
  },
  subtitle: {
    ko: '2024 K팝 여름 결산',
    en: '2024 K-Pop Summer Hits',
    ja: '2024 K-POP夏まとめ',
    vi: 'K-Pop Hè 2024'
  },
  detail: {
    headerImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    sections: [{
      id: 's1',
      type: 'ranking',
      title: {
        ko: '이번 여름 최고의 곡',
        en: 'Best Songs This Summer',
        ja: 'この夏最高の曲',
        vi: 'Bài hay nhất hè này'
      },
      items: [{
        id: 'r1',
        label: {
          ko: 'IVE — Accendio',
          en: 'IVE — Accendio',
          ja: 'IVE — Accendio',
          vi: 'IVE — Accendio'
        },
        value: '🔥 1위',
        image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=80&h=80&fit=crop'
      }, {
        id: 'r2',
        label: {
          ko: 'BLACKPINK — Sheesh',
          en: 'BLACKPINK — Sheesh',
          ja: 'BLACKPINK — Sheesh',
          vi: 'BLACKPINK — Sheesh'
        },
        value: '2위',
        image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=80&h=80&fit=crop'
      }, {
        id: 'r3',
        label: {
          ko: 'BTS — Yet To Come',
          en: 'BTS — Yet To Come',
          ja: 'BTS — Yet To Come',
          vi: 'BTS — Yet To Come'
        },
        value: '3위',
        image: 'https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=80&h=80&fit=crop'
      }, {
        id: 'r4',
        label: {
          ko: 'Stray Kids — MIROH',
          en: 'Stray Kids — MIROH',
          ja: 'Stray Kids — MIROH',
          vi: 'Stray Kids — MIROH'
        },
        value: '4위',
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=80&h=80&fit=crop'
      }]
    }, {
      id: 's2',
      type: 'poll',
      title: {
        ko: '이번 여름 가장 많이 들은 장르는?',
        en: 'Most listened genre this summer?',
        ja: 'この夏最も聴いたジャンルは？',
        vi: 'Thể loại nghe nhiều nhất hè này?'
      },
      items: [{
        id: 'p1',
        label: {
          ko: '💗 K-POP 댄스',
          en: '💗 K-POP Dance',
          ja: '💗 K-POPダンス',
          vi: '💗 K-POP Dance'
        },
        percent: 48,
        votes: 3201
      }, {
        id: 'p2',
        label: {
          ko: '🎵 K-발라드',
          en: '🎵 K-Ballad',
          ja: '🎵 K-バラード',
          vi: '🎵 K-Ballad'
        },
        percent: 28,
        votes: 1870
      }, {
        id: 'p3',
        label: {
          ko: '🎤 K-인디',
          en: '🎤 K-Indie',
          ja: '🎤 K-インディ',
          vi: '🎤 K-Indie'
        },
        percent: 24,
        votes: 1601
      }]
    }]
  }
}, {
  id: 'qc4',
  type: 'horoscope',
  emoji: '✨',
  image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop',
  gradientFrom: 'from-amber-500',
  gradientTo: 'to-rose-500',
  title: {
    ko: '오늘의 운세',
    en: 'Today\'s Horoscope',
    ja: '今日の運勢',
    vi: 'Vận mệnh hôm nay'
  },
  subtitle: {
    ko: '아이돌 별자리 운세',
    en: 'Idol Zodiac Reading',
    ja: 'アイドル星座占い',
    vi: 'Cung hoàng đạo idol'
  },
  detail: {
    headerImage: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=400&fit=crop',
    sections: [{
      id: 's1',
      type: 'ranking',
      title: {
        ko: '오늘의 행운 별자리 TOP 3',
        en: 'Top 3 Lucky Signs Today',
        ja: '今日の幸運星座TOP3',
        vi: 'Top 3 cung may mắn hôm nay'
      },
      items: [{
        id: 'r1',
        label: {
          ko: '♍ 처녀자리 — 슈가 · 지수',
          en: '♍ Virgo — Suga · Jisoo',
          ja: '♍ 乙女座 — SUGA・ジス',
          vi: '♍ Xử Nữ — Suga · Jisoo'
        },
        value: '⭐⭐⭐',
        image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop'
      }, {
        id: 'r2',
        label: {
          ko: '♎ 천칭자리 — 제니 · 뷔',
          en: '♎ Libra — Jennie · V',
          ja: '♎ 天秤座 — ジェニー・V',
          vi: '♎ Thiên Bình — Jennie · V'
        },
        value: '⭐⭐⭐',
        image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=80&h=80&fit=crop'
      }, {
        id: 'r3',
        label: {
          ko: '♓ 물고기자리 — RM · 아이유',
          en: '♓ Pisces — RM · IU',
          ja: '♓ 魚座 — RM・IU',
          vi: '♓ Song Ngư — RM · IU'
        },
        value: '⭐⭐',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop'
      }]
    }, {
      id: 's2',
      type: 'poll',
      title: {
        ko: '당신의 K-아이돌 별자리 궁합은?',
        en: 'Your K-idol zodiac match?',
        ja: 'あなたのK-アイドル相性は？',
        vi: 'Cung hoàng đạo idol của bạn?'
      },
      items: [{
        id: 'p1',
        label: {
          ko: '💜 BTS 멤버',
          en: '💜 BTS Member',
          ja: '💜 BTSメンバー',
          vi: '💜 Thành viên BTS'
        },
        percent: 39,
        votes: 5621
      }, {
        id: 'p2',
        label: {
          ko: '🖤 BLACKPINK 멤버',
          en: '🖤 BLACKPINK Member',
          ja: '🖤 BLACKPINKメンバー',
          vi: '🖤 Thành viên BLACKPINK'
        },
        percent: 31,
        votes: 4470
      }, {
        id: 'p3',
        label: {
          ko: '✨ IVE 멤버',
          en: '✨ IVE Member',
          ja: '✨ IVEメンバー',
          vi: '✨ Thành viên IVE'
        },
        percent: 30,
        votes: 4330
      }]
    }, {
      id: 's3',
      type: 'discussion',
      title: {
        ko: '운세 리뷰',
        en: 'Horoscope Reviews',
        ja: '運勢レビュー',
        vi: 'Đánh giá vận mệnh'
      },
      items: [{
        id: 'd1',
        label: {
          ko: '"처녀자리인데 오늘 진짜 좋은 일이 있었어요 🌟" — star_kr 🇰🇷',
          en: '"I\'m a Virgo and had a great day today 🌟" — star_kr 🇰🇷',
          ja: '"乙女座ですが今日いいことがありました 🌟" — star_kr 🇰🇷',
          vi: '"Là Xử Nữ và hôm nay có điều tốt 🌟" — star_kr 🇰🇷'
        },
        value: '↑ 284'
      }, {
        id: 'd2',
        label: {
          ko: '"천칭자리 제니랑 같은 별자리라 기뻐요 💕" — libra_blink 🇻🇳',
          en: '"Same sign as Jennie (Libra) 💕" — libra_blink 🇻🇳',
          ja: '"ジェニーと同じ天秤座で嬉しい 💕" — libra_blink 🇻🇳',
          vi: '"Cùng cung Thiên Bình với Jennie 💕" — libra_blink 🇻🇳'
        },
        value: '↑ 198'
      }]
    }]
  }
}, {
  id: 'qc5',
  type: 'challenge',
  emoji: '💃',
  image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
  gradientFrom: 'from-violet-500',
  gradientTo: 'to-pink-500',
  title: {
    ko: '댄스 챌린지',
    en: 'Dance Challenge',
    ja: 'ダンスチャレンジ',
    vi: 'Thử thách nhảy'
  },
  subtitle: {
    ko: 'K-POP 안무 따라하기',
    en: 'Copy K-Pop Moves',
    ja: 'K-POPダンス真似',
    vi: 'Nhảy theo K-Pop'
  },
  detail: {
    headerImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=400&fit=crop',
    sections: [{
      id: 's1',
      type: 'poll',
      title: {
        ko: '가장 따라하고 싶은 안무는?',
        en: 'Which choreography to copy?',
        ja: '真似したい振付は？',
        vi: 'Vũ đạo nào bạn muốn nhảy theo?'
      },
      items: [{
        id: 'p1',
        label: {
          ko: '💜 IVE — Accendio',
          en: '💜 IVE — Accendio',
          ja: '💜 IVE — Accendio',
          vi: '💜 IVE — Accendio'
        },
        percent: 43,
        votes: 2301
      }, {
        id: 'p2',
        label: {
          ko: '🖤 BLACKPINK — Shut Down',
          en: '🖤 BLACKPINK — Shut Down',
          ja: '🖤 BLACKPINK — Shut Down',
          vi: '🖤 BLACKPINK — Shut Down'
        },
        percent: 57,
        votes: 3041
      }]
    }]
  }
}, {
  id: 'qc6',
  type: 'hottopic',
  emoji: '🎭',
  image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=300&fit=crop',
  gradientFrom: 'from-blue-600',
  gradientTo: 'to-cyan-500',
  title: {
    ko: '드라마 토론',
    en: 'Drama Discussion',
    ja: 'ドラマ議論',
    vi: 'Thảo luận phim'
  },
  subtitle: {
    ko: '오징어게임3 기대 VS 걱정',
    en: 'Squid Game 3: Hype vs Fear',
    ja: 'イカゲーム3：期待 vs 不安',
    vi: 'Squid Game 3: Hype hay lo lắng'
  },
  detail: {
    headerImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=400&fit=crop',
    sections: [{
      id: 's1',
      type: 'poll',
      title: {
        ko: '시즌3에 대한 당신의 감정은?',
        en: 'How do you feel about Season 3?',
        ja: 'シーズン3についての感情は？',
        vi: 'Cảm xúc của bạn về Season 3?'
      },
      items: [{
        id: 'p1',
        label: {
          ko: '🔥 너무 기대돼요!',
          en: '🔥 Super hyped!',
          ja: '🔥 めちゃ楽しみ！',
          vi: '🔥 Hào hứng lắm!'
        },
        percent: 61,
        votes: 9821
      }, {
        id: 'p2',
        label: {
          ko: '😰 망칠까봐 걱정이에요',
          en: '😰 Worried it\'ll flop',
          ja: '😰 失敗が心配です',
          vi: '😰 Lo bị thất vọng'
        },
        percent: 39,
        votes: 6271
      }]
    }]
  }
}, {
  id: 'qc7',
  type: 'playlist',
  emoji: '🎤',
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop',
  gradientFrom: 'from-rose-500',
  gradientTo: 'to-amber-500',
  title: {
    ko: 'OST 모음',
    en: 'OST Collection',
    ja: 'OST特集',
    vi: 'Tuyển tập OST'
  },
  subtitle: {
    ko: '2024 K-드라마 명장면 OST',
    en: '2024 K-Drama OST Gems',
    ja: '2024 K-ドラマOST名曲',
    vi: 'OST K-Drama 2024 đỉnh nhất'
  },
  detail: {
    headerImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    sections: [{
      id: 's1',
      type: 'ranking',
      title: {
        ko: '이번 달 가장 많이 스트리밍된 OST',
        en: 'Most Streamed OSTs This Month',
        ja: '今月最も多くストリーミングされたOST',
        vi: 'OST được stream nhiều nhất tháng này'
      },
      items: [{
        id: 'r1',
        label: {
          ko: '폭풍의 언덕 — 그리움',
          en: 'Storm on the Hill — Longing',
          ja: '嵐の丘 — 恋しさ',
          vi: 'Đồi Bão Tố — Nỗi nhớ'
        },
        value: '🔥 1위',
        image: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=80&h=80&fit=crop'
      }, {
        id: 'r2',
        label: {
          ko: '무빙 — 하늘을 날다',
          en: 'Moving — Flying High',
          ja: 'ムービング — 空を飛ぶ',
          vi: 'Moving — Bay cao'
        },
        value: '2위',
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=80&h=80&fit=crop'
      }, {
        id: 'r3',
        label: {
          ko: '나의 아저씨 — 어른',
          en: 'My Mister — Adult',
          ja: 'マイ・ディア・ミスター — 大人',
          vi: 'Anh Trai Tôi — Người lớn'
        },
        value: '3위',
        image: 'https://images.unsplash.com/photo-1555992336-03a23c7b20ee?w=80&h=80&fit=crop'
      }]
    }]
  }
}, {
  id: 'qc8',
  type: 'horoscope',
  emoji: '🌸',
  image: 'https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=400&h=300&fit=crop',
  gradientFrom: 'from-pink-400',
  gradientTo: 'to-purple-600',
  title: {
    ko: 'K-뷰티 팁',
    en: 'K-Beauty Tips',
    ja: 'K-ビューティーTips',
    vi: 'Mẹo K-Beauty'
  },
  subtitle: {
    ko: '이번 주 피부 타입별 루틴',
    en: 'This Week\'s Skin Routine',
    ja: '今週の肌タイプ別ルーティン',
    vi: 'Routine da theo tuần này'
  },
  detail: {
    headerImage: 'https://images.unsplash.com/photo-1571204829887-3b8d69e4094d?w=800&h=400&fit=crop',
    sections: [{
      id: 's1',
      type: 'poll',
      title: {
        ko: '당신의 피부 타입은?',
        en: 'What\'s your skin type?',
        ja: 'あなたの肌タイプは？',
        vi: 'Loại da của bạn là gì?'
      },
      items: [{
        id: 'p1',
        label: {
          ko: '💧 건성',
          en: '💧 Dry',
          ja: '💧 乾燥肌',
          vi: '💧 Da khô'
        },
        percent: 27,
        votes: 1821
      }, {
        id: 'p2',
        label: {
          ko: '✨ 지성',
          en: '✨ Oily',
          ja: '✨ 脂性肌',
          vi: '✨ Da dầu'
        },
        percent: 35,
        votes: 2359
      }, {
        id: 'p3',
        label: {
          ko: '🌿 복합성',
          en: '🌿 Combo',
          ja: '🌿 混合肌',
          vi: '🌿 Da hỗn hợp'
        },
        percent: 38,
        votes: 2561
      }]
    }]
  }
}];

// --- K-숏폼 Data ---
type KShortformItem = {
  id: string;
  title: Record<Lang, string>;
  channel: string;
  channelLogo: string;
  views: Record<Lang, string>;
  timeAgo: Record<Lang, string>;
  thumbnail: string;
  duration: string;
  category: string;
  categoryColor: string;
};
const K_SHORTFORM_LIST: KShortformItem[] = [{
  id: 'sf1',
  title: {
    ko: 'BTS 슈가 전역 현장 LIVE… 아미들 눈물 바다',
    en: 'BTS Suga discharge LIVE… ARMYs in tears',
    ja: 'BTS SUGA除隊現場LIVE…ARMYが涙',
    vi: 'LIVE xuất ngũ Suga BTS… ARMY khóc'
  },
  channel: '한국경제TV',
  channelLogo: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop',
  views: {
    ko: '12.1만',
    en: '121K',
    ja: '12.1万',
    vi: '121K'
  },
  timeAgo: {
    ko: '1시간 전',
    en: '1h ago',
    ja: '1時間前',
    vi: '1 giờ trước'
  },
  thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=600&fit=crop',
  duration: '5:47',
  category: 'K-POP',
  categoryColor: 'bg-pink-500'
}, {
  id: 'sf2',
  title: {
    ko: '제니 솔로 2집 티저 15초… SNS 난리난 글로벌 반응',
    en: 'Jennie solo album 2 teaser 15s… global SNS explodes',
    ja: 'ジェニーソロ2ndティザー15秒…SNS爆発',
    vi: 'Teaser 15s album solo 2 Jennie… SNS toàn cầu nổ tung'
  },
  channel: 'K-POP채널',
  channelLogo: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=80&h=80&fit=crop',
  views: {
    ko: '9.8만',
    en: '98K',
    ja: '9.8万',
    vi: '98K'
  },
  timeAgo: {
    ko: '2시간 전',
    en: '2h ago',
    ja: '2時間前',
    vi: '2 giờ trước'
  },
  thumbnail: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=600&fit=crop',
  duration: '2:38',
  category: 'K-POP',
  categoryColor: 'bg-pink-500'
}, {
  id: 'sf3',
  title: {
    ko: '오징어게임3 제작 확정! 황동혁 감독 단독 인터뷰',
    en: 'Squid Game 3 confirmed! Exclusive director interview',
    ja: 'イカゲーム3確定！監督単独インタビュー',
    vi: 'Squid Game 3 xác nhận! Phỏng vấn độc quyền đạo diễn'
  },
  channel: 'K드라마TV',
  channelLogo: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=80&h=80&fit=crop',
  views: {
    ko: '15.3만',
    en: '153K',
    ja: '15.3万',
    vi: '153K'
  },
  timeAgo: {
    ko: '4시간 전',
    en: '4h ago',
    ja: '4時間前',
    vi: '4 giờ trước'
  },
  thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
  duration: '6:12',
  category: 'K-DRAMA',
  categoryColor: 'bg-violet-500'
}, {
  id: 'sf_ad',
  title: {
    ko: '🍜 불닭볶음면 신제품 출시! 까르보 2배매운맛 도전',
    en: '🍜 Buldak new flavor! 2x spicy carbonara challenge',
    ja: '🍜 プルダック新発売！カルボ2倍辛挑戦',
    vi: '🍜 Ra mắt Buldak mới! Thử thách Carbonara cay gấp đôi'
  },
  channel: '삼양라면 공식',
  channelLogo: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=80&h=80&fit=crop',
  views: {
    ko: '광고',
    en: 'AD',
    ja: '広告',
    vi: 'Quảng cáo'
  },
  timeAgo: {
    ko: '지금 이벤트 중',
    en: 'Event now',
    ja: 'イベント中',
    vi: 'Đang có sự kiện'
  },
  thumbnail: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=600&fit=crop',
  duration: '0:30',
  category: '광고',
  categoryColor: 'bg-orange-500'
}, {
  id: 'sf4',
  title: {
    ko: '아이브 월드투어 미국 공연 현장 직캠 4K',
    en: 'IVE World Tour US concert direct cam 4K',
    ja: 'IVEワールドツアー米国公演直撮り4K',
    vi: 'Fancam 4K concert Mỹ của IVE World Tour'
  },
  channel: '아이브공식',
  channelLogo: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=80&h=80&fit=crop',
  views: {
    ko: '21.4만',
    en: '214K',
    ja: '21.4万',
    vi: '214K'
  },
  timeAgo: {
    ko: '3시간 전',
    en: '3h ago',
    ja: '3時間前',
    vi: '3 giờ trước'
  },
  thumbnail: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=600&fit=crop',
  duration: '4:55',
  category: 'K-POP',
  categoryColor: 'bg-pink-500'
}, {
  id: 'sf5',
  title: {
    ko: '유리피부 K-뷰티 루틴 5분 완성 (아모레퍼시픽)',
    en: 'Glass skin K-Beauty routine 5 min (AmorePacific)',
    ja: 'ガラス肌K-ビューティールーティン5分（アモレパシフィック）',
    vi: 'Routine da thủy tinh K-Beauty 5 phút (AmorePacific)'
  },
  channel: 'K뷰티채널',
  channelLogo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&h=80&fit=crop',
  views: {
    ko: '5.2만',
    en: '52K',
    ja: '5.2万',
    vi: '52K'
  },
  timeAgo: {
    ko: '6시간 전',
    en: '6h ago',
    ja: '6時間前',
    vi: '6 giờ trước'
  },
  thumbnail: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=600&fit=crop',
  duration: '4:32',
  category: 'K-BEAUTY',
  categoryColor: 'bg-rose-400'
}, {
  id: 'sf6',
  title: { ko: '뉴진스 컴백 무대 최초 공개! 팬들 반응 폭발', en: 'NewJeans comeback stage premiere! Fan reactions explode', ja: 'NewJeansカムバックステージ初公開！ファン反応爆発', vi: 'Sân khấu comeback NewJeans lần đầu công bố! Fan phản ứng mạnh' },
  channel: 'Kpop Diary',
  channelLogo: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=80&h=80&fit=crop',
  views: { ko: '18.7만', en: '187K', ja: '18.7万', vi: '187K' },
  timeAgo: { ko: '30분 전', en: '30m ago', ja: '30分前', vi: '30 phút trước' },
  thumbnail: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=400&h=600&fit=crop',
  duration: '3:21',
  category: 'K-POP',
  categoryColor: 'bg-pink-500'
}, {
  id: 'sf7',
  title: { ko: '오징어게임 시즌3 제작발표회 현장 중계', en: 'Squid Game Season 3 production press conference live', ja: 'イカゲームシーズン3制作発表会現場中継', vi: 'Trực tiếp họp báo sản xuất Squid Game Season 3' },
  channel: 'K드라마TV',
  channelLogo: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=80&h=80&fit=crop',
  views: { ko: '22.1만', en: '221K', ja: '22.1万', vi: '221K' },
  timeAgo: { ko: '2시간 전', en: '2h ago', ja: '2時間前', vi: '2 giờ trước' },
  thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop',
  duration: '7:04',
  category: 'K-DRAMA',
  categoryColor: 'bg-violet-500'
}, {
  id: 'sf8',
  title: { ko: '눈물의 여왕 OST 비하인드… 김수현 직접 불렀다?', en: 'Queen of Tears OST behind the scenes… Kim Soo-hyun sang it?', ja: '涙の女王OST裏話…キム・スヒョン本人が歌った？', vi: 'Hậu trường OST Queen of Tears… Kim Soo-hyun tự hát?' },
  channel: '드라마인사이드',
  channelLogo: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=80&h=80&fit=crop',
  views: { ko: '8.4만', en: '84K', ja: '8.4万', vi: '84K' },
  timeAgo: { ko: '5시간 전', en: '5h ago', ja: '5時間前', vi: '5 giờ trước' },
  thumbnail: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop',
  duration: '5:18',
  category: 'K-DRAMA',
  categoryColor: 'bg-violet-500'
}, {
  id: 'sf9',
  title: { ko: '무빙 시즌2 티저 최초 공개! 유아인 복귀하나', en: 'Moving Season 2 teaser premiere! Yoo Ah-in returning?', ja: 'Moving シーズン2ティーザー初公開！ユ・アイン復帰か', vi: 'Teaser Moving Season 2 lần đầu! Yoo Ah-in trở lại?' },
  channel: 'KdramaClip',
  channelLogo: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=80&h=80&fit=crop',
  views: { ko: '11.2만', en: '112K', ja: '11.2万', vi: '112K' },
  timeAgo: { ko: '7시간 전', en: '7h ago', ja: '7時間前', vi: '7 giờ trước' },
  thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=600&fit=crop',
  duration: '4:45',
  category: 'K-DRAMA',
  categoryColor: 'bg-violet-500'
}, {
  id: 'sf10',
  title: { ko: '한국식 삼겹살 파티 세계로… 외국인 반응 모음', en: 'Korean samgyeopsal party goes global… foreigner reactions', ja: '韓国式サムギョプサルパーティーが世界へ…外国人の反応まとめ', vi: 'Tiệc samgyeopsal Hàn Quốc ra thế giới… phản ứng người nước ngoài' },
  channel: '한식TV',
  channelLogo: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=80&h=80&fit=crop',
  views: { ko: '7.3만', en: '73K', ja: '7.3万', vi: '73K' },
  timeAgo: { ko: '3시간 전', en: '3h ago', ja: '3時間前', vi: '3 giờ trước' },
  thumbnail: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=600&fit=crop',
  duration: '6:02',
  category: 'K-FOOD',
  categoryColor: 'bg-orange-400'
}, {
  id: 'sf11',
  title: { ko: '편의점 K-푸드 챌린지! 불닭·떡볶이·김밥 먹방', en: 'Convenience store K-Food challenge! Buldak·Tteokbokki·Gimbap mukbang', ja: 'コンビニK-フードチャレンジ！プルダック・トッポッキ・キンパ食べ歩き', vi: 'Thử thách K-Food cửa hàng tiện lợi! Buldak·Tteokbokki·Gimbap mukbang' },
  channel: 'K먹방채널',
  channelLogo: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=80&h=80&fit=crop',
  views: { ko: '14.5만', en: '145K', ja: '14.5万', vi: '145K' },
  timeAgo: { ko: '4시간 전', en: '4h ago', ja: '4時間前', vi: '4 giờ trước' },
  thumbnail: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400&h=600&fit=crop',
  duration: '8:33',
  category: 'K-FOOD',
  categoryColor: 'bg-orange-400'
}, {
  id: 'sf12',
  title: { ko: '미슐랭 셰프가 인정한 K-푸드 레시피 TOP 5', en: 'Michelin chef-approved K-Food recipes TOP 5', ja: 'ミシュランシェフ認定K-フードレシピTOP5', vi: 'TOP 5 công thức K-Food được đầu bếp Michelin công nhận' },
  channel: '코리안쿡',
  channelLogo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=80&h=80&fit=crop',
  views: { ko: '9.6만', en: '96K', ja: '9.6万', vi: '96K' },
  timeAgo: { ko: '9시간 전', en: '9h ago', ja: '9時間前', vi: '9 giờ trước' },
  thumbnail: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=600&fit=crop',
  duration: '5:50',
  category: 'K-FOOD',
  categoryColor: 'bg-orange-400'
}, {
  id: 'sf13',
  title: { ko: '라면 하나로 세계 정복… 신라면 글로벌 공장 탐방', en: 'Conquering the world with one ramen… Shin Ramen global factory tour', ja: 'ラーメン一つで世界征服…辛ラーメングローバル工場見学', vi: 'Chinh phục thế giới với một gói mì… tham quan nhà máy toàn cầu Shin Ramen' },
  channel: '푸드다큐',
  channelLogo: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=80&h=80&fit=crop',
  views: { ko: '6.8만', en: '68K', ja: '6.8万', vi: '68K' },
  timeAgo: { ko: '11시간 전', en: '11h ago', ja: '11時間前', vi: '11 giờ trước' },
  thumbnail: 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&h=600&fit=crop',
  duration: '9:15',
  category: 'K-FOOD',
  categoryColor: 'bg-orange-400'
}, {
  id: 'sf14',
  title: { ko: 'K-뷰티 입문자를 위한 기초 스킨케어 루틴 완벽 정리', en: 'Complete beginner K-Beauty basic skincare routine guide', ja: 'K-ビューティー初心者のための基礎スキンケアルーティン完全まとめ', vi: 'Hướng dẫn hoàn chỉnh skincare cơ bản K-Beauty cho người mới' },
  channel: 'K뷰티채널',
  channelLogo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=80&h=80&fit=crop',
  views: { ko: '13.2만', en: '132K', ja: '13.2万', vi: '132K' },
  timeAgo: { ko: '8시간 전', en: '8h ago', ja: '8時間前', vi: '8 giờ trước' },
  thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=600&fit=crop',
  duration: '6:44',
  category: 'K-BEAUTY',
  categoryColor: 'bg-rose-400'
}, {
  id: 'sf15',
  title: { ko: '올리브영 하울 2024 여름 신상 총정리', en: 'Olive Young haul 2024 summer new arrivals roundup', ja: 'オリーブヤングハウル2024夏新作総まとめ', vi: 'Haul Olive Young tổng hợp hàng mới hè 2024' },
  channel: '뷰티인사이드',
  channelLogo: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=80&h=80&fit=crop',
  views: { ko: '4.9만', en: '49K', ja: '4.9万', vi: '49K' },
  timeAgo: { ko: '13시간 전', en: '13h ago', ja: '13時間前', vi: '13 giờ trước' },
  thumbnail: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=600&fit=crop',
  duration: '7:20',
  category: 'K-BEAUTY',
  categoryColor: 'bg-rose-400'
}, {
  id: 'sf16',
  title: { ko: '아이돌이 쓰는 메이크업 따라하기… 르세라핌 스타일', en: 'Copying idol makeup… LE SSERAFIM style', ja: 'アイドルのメイクをマネする…ルセラフィムスタイル', vi: 'Bắt chước makeup idol… phong cách LE SSERAFIM' },
  channel: '글로우업TV',
  channelLogo: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=80&h=80&fit=crop',
  views: { ko: '16.3만', en: '163K', ja: '16.3万', vi: '163K' },
  timeAgo: { ko: '2시간 전', en: '2h ago', ja: '2時間前', vi: '2 giờ trước' },
  thumbnail: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=600&fit=crop',
  duration: '5:55',
  category: 'K-BEAUTY',
  categoryColor: 'bg-rose-400'
}];

// --- Featured Banner Data ---
type FeaturedBannerItem = {
  id: string;
  type: 'news' | 'ad';
  articleId?: string;
  title: Record<Lang, string>;
  subtitle?: Record<Lang, string>;
  badge?: Record<Lang, string>;
  image: string;
  gradientFrom: string;
  gradientTo: string;
  adBrand?: string;
  adCta?: Record<Lang, string>;
  categoryColor?: string;
  category?: string;
};
const FEATURED_BANNERS: FeaturedBannerItem[] = [{
  id: 'fb1',
  type: 'news',
  articleId: 'a1',
  title: {
    ko: 'BTS 슈가, 전역 후 첫 공식 활동 재개… 솔로 프로젝트 하반기 확정',
    en: 'BTS Suga Returns After Military Discharge — Solo Project Confirmed for H2',
    ja: 'BTS SUGA除隊後初の公式活動、ソロプロジェクトが下半期に確定',
    vi: 'Suga BTS tái xuất sau nghĩa vụ quân sự — Dự án solo xác nhận nửa cuối năm'
  },
  subtitle: {
    ko: 'HYBE 공식 발표 · 글로벌 ARMY 반응 폭발 · 트위터 실시간 1위',
    en: 'HYBE official announcement · Global ARMY reaction · Twitter #1 trending',
    ja: 'HYBE公式発表・グローバルARMY反応・Twitterリアルタイム1位',
    vi: 'Thông báo chính thức HYBE · Phản ứng ARMY toàn cầu · Top 1 Twitter'
  },
  badge: {
    ko: '주목 기사',
    en: 'Featured',
    ja: '注目記事',
    vi: 'Nổi bật'
  },
  image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=500&fit=crop',
  gradientFrom: 'from-pink-600',
  gradientTo: 'to-violet-700',
  category: 'K-POP',
  categoryColor: 'bg-pink-500'
}, {
  id: 'fb2',
  type: 'ad',
  title: {
    ko: '올리브영 여름 세일 🌿\nK-뷰티 최대 50% 할인',
    en: 'Olive Young Summer Sale 🌿\nUp to 50% OFF K-Beauty',
    ja: 'オリーブヤング夏セール 🌿\nK-ビューティー最大50%オフ',
    vi: 'Sale hè Olive Young 🌿\nGiảm đến 50% K-Beauty'
  },
  subtitle: {
    ko: '지금 앱에서 쿠폰 받기 →',
    en: 'Get coupon in app now →',
    ja: '今すぐアプリでクーポンを →',
    vi: 'Nhận coupon trên app ngay →'
  },
  badge: {
    ko: '광고',
    en: 'AD',
    ja: '広告',
    vi: 'Quảng cáo'
  },
  image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&h=500&fit=crop',
  gradientFrom: 'from-emerald-500',
  gradientTo: 'to-teal-600',
  adBrand: 'OLIVE YOUNG',
  adCta: {
    ko: '지금 쇼핑하기',
    en: 'Shop Now',
    ja: '今すぐ購入',
    vi: 'Mua ngay'
  }
}, {
  id: 'fb3',
  type: 'news',
  articleId: 'a6',
  title: {
    ko: '《오징어게임3》 제작 확정… 황동혁 감독 "최고의 엔딩 약속"',
    en: '"Squid Game 3" Confirmed — Director Promises "The Best Ending Ever"',
    ja: '「イカゲーム3」制作確定、監督「最高のエンディングを約束」',
    vi: '"Squid Game 3" xác nhận — Đạo diễn hứa "Kết thúc hay nhất từ trước"'
  },
  subtitle: {
    ko: '넷플릭스 역대급 예산 투입 · 시즌2 대비 20% 증가 · 2025년 공개 목표',
    en: 'Netflix record budget · 20% more than S2 · Targeting 2025 release',
    ja: 'Netflix最大予算投入・S2比20%増・2025年公開目標',
    vi: 'Ngân sách kỷ lục Netflix · Tăng 20% so S2 · Mục tiêu 2025'
  },
  badge: {
    ko: '핫뉴스',
    en: 'Hot News',
    ja: 'ホットニュース',
    vi: 'Tin Hot'
  },
  image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop',
  gradientFrom: 'from-violet-600',
  gradientTo: 'to-indigo-800',
  category: 'K-DRAMA',
  categoryColor: 'bg-violet-500'
}];

// --- Live Comment Ticker Data ---
type LiveCommentTick = {
  id: string;
  user: string;
  flag: string;
  text: Record<Lang, string>;
  threadId: string;
  commentId?: string;
};
const LIVE_COMMENT_TICKS: LiveCommentTick[] = [{
  id: 'lt1',
  user: 'minji_k',
  flag: '🇰🇷',
  threadId: 'th1',
  commentId: 'c1',
  text: {
    ko: '어거스트 디 감성 그대로 가줬으면 좋겠어요. 그게 슈가의 진짜 색깔이라고 생각해요.',
    en: "I hope he keeps the Agust D vibe. That's the real Suga to me.",
    ja: 'Agust Dの雰囲気のままでいてほしい。',
    vi: 'Mình muốn anh ấy giữ nguyên hồn Agust D.'
  }
}, {
  id: 'lt2',
  user: 'yuki_army',
  flag: '🇯🇵',
  threadId: 'th1',
  commentId: 'c2',
  text: {
    ko: '이번엔 좀 더 팝적인 접근을 해도 좋을 것 같아요.',
    en: 'A more pop-oriented approach would be nice this time.',
    ja: '今回はもう少しポップなアプローチも良いと思います。',
    vi: 'Lần này thử hướng pop hơn cũng hay đấy.'
  }
}, {
  id: 'lt3',
  user: 'drama_fan',
  flag: '🇺🇸',
  threadId: 'th2',
  commentId: 'c4',
  text: {
    ko: '원작보다 감정 표현이 훨씬 풍부해요. 한국 배우들의 연기력이 정말 빛나는 작품입니다.',
    en: 'The emotional depth is so much richer than the original. Korean actors really shine here.',
    ja: '感情表現が原作よりずっと豊かです。',
    vi: 'Chiều sâu cảm xúc phong phú hơn nguyên tác rất nhiều.'
  }
}, {
  id: 'lt4',
  user: 'blink_thai',
  flag: '🇹🇭',
  threadId: 'th1',
  text: {
    ko: '제니 솔로 2집 기다리다 미칠 것 같아요 🖤',
    en: 'Going crazy waiting for Jennie solo 2 🖤',
    ja: 'ジェニーソロ2ndを待ちきれない 🖤',
    vi: 'Điên vì chờ Jennie solo 2 🖤'
  }
}, {
  id: 'lt5',
  user: 'nguyen_foodie',
  flag: '🇻🇳',
  threadId: 'th3',
  commentId: 'c6',
  text: {
    ko: '베트남에서 불닭볶음면이 완전히 대세예요!',
    en: 'Buldak is absolutely huge in Vietnam!',
    ja: 'ベトナムでは辛ラーメンが完全に流行っています！',
    vi: 'Mì Buldak đang cực kỳ hot ở Việt Nam!'
  }
}, {
  id: 'lt6',
  user: 'paris_kdrama',
  flag: '🇫🇷',
  threadId: 'th2',
  commentId: 'c10',
  text: {
    ko: '프랑스 문학 전공자인데, 원작의 핵심 주제를 한국 사회 맥락에 너무 자연스럽게 녹여냈어요. 박사 논문 쓰고 싶은 수준 😂',
    en: 'As a French Lit major, they integrated the core themes into Korean social context so naturally. PhD-thesis level stuff 😂',
    ja: 'フランス文学専攻ですが、原作の核心テーマを韓国社会の文脈に自然に溶け込ませています。博士論文が書けそうなレベル 😂',
    vi: 'Là sinh viên văn học Pháp, họ đã lồng ghép các chủ đề cốt lõi vào bối cảnh xã hội Hàn Quốc rất tự nhiên. Đủ để viết luận văn tiến sĩ 😂'
  }
}, {
  id: 'lt7',
  user: 'suga_forever',
  flag: '🇰🇷',
  threadId: 'th1',
  commentId: 'c8',
  text: {
    ko: '어떤 장르든 슈가가 만들면 명곡이에요. 그냥 믿고 기다릴게요 💜',
    en: "Whatever genre it is, if Suga makes it, it'll be a masterpiece. Just trust and wait 💜",
    ja: 'どんなジャンルでもSUGAが作れば名曲。ただ信じて待ちます 💜',
    vi: 'Dù thể loại gì, Suga làm là kiệt tác. Cứ tin tưởng và chờ thôi 💜'
  }
}, {
  id: 'lt8',
  user: 'berlin_kfood',
  flag: '🇩🇪',
  threadId: 'th3',
  commentId: 'c12',
  text: {
    ko: '독일 베를린 아시아 마트에서 신라면이 독일 인스턴트 라면보다 비싼데도 더 잘 팔려요. 진짜 신기해요.',
    en: "In Berlin Asian markets, Shin Ramen sells better than German instant noodles even though it's more expensive. Truly amazing.",
    ja: 'ベルリンのアジアマートでは辛ラーメンがドイツのインスタントラーメンより高いのによく売れています。',
    vi: 'Ở chợ châu Á Berlin, Shin Ramen bán chạy hơn mì ăn liền Đức dù đắt hơn. Thật kỳ lạ.'
  }
}];

// --- Emoji Avatar Options ---
const EMOJI_AVATARS: {
  id: string;
  emoji: string;
  label: string;
}[] = [{
  id: 'ea1',
  emoji: '🐱',
  label: '고양이'
}, {
  id: 'ea2',
  emoji: '🦊',
  label: '여우'
}, {
  id: 'ea3',
  emoji: '🐼',
  label: '판다'
}, {
  id: 'ea4',
  emoji: '🦄',
  label: '유니콘'
}, {
  id: 'ea5',
  emoji: '🐨',
  label: '코알라'
}, {
  id: 'ea6',
  emoji: '🐯',
  label: '호랑이'
}, {
  id: 'ea7',
  emoji: '🦁',
  label: '사자'
}, {
  id: 'ea8',
  emoji: '🐸',
  label: '개구리'
}];

// --- Comment Reaction Emojis (extended, categorized) ---
type ReactionCategory = {
  id: string;
  label: string;
  emojis: string[];
};
const REACTION_CATEGORIES: ReactionCategory[] = [{
  id: 'fav',
  label: '자주 쓰는',
  emojis: ['💜', '🔥', '😭', '🥺', '😍', '😂', '👏', '✨', '💯', '🫶']
}, {
  id: 'face',
  label: '표정',
  emojis: ['😊', '😆', '🥳', '😤', '😱', '🤩', '🥰', '😎', '🤔', '😮']
}, {
  id: 'etc',
  label: '기타',
  emojis: ['🎵', '🎤', '🎬', '🌊', '🌸', '⭐', '👑', '🏆', '🎭', '🎧', '❤️', '🧡', '💛', '💚', '💙', '🖤', '🤍', '💕', '💗', '🌈']
}];

// --- Helpers ---
function t(lang: Lang, key: string): string {
  return I18N[lang]?.[key] ?? key;
}
const BOTTOM_NAV_ITEMS: {
  id: Tab;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  labelKey: string;
}[] = [{
  id: 'home',
  icon: <Home size={22} />,
  activeIcon: <Home size={22} strokeWidth={2.5} />,
  labelKey: 'tabHome'
}, {
  id: 'community',
  icon: <Users size={22} />,
  activeIcon: <Users size={22} strokeWidth={2.5} />,
  labelKey: 'tabCommunity'
}, {
  id: 'profile',
  icon: <User size={22} />,
  activeIcon: <User size={22} strokeWidth={2.5} />,
  labelKey: 'tabProfile'
}];

// --- Toggle Switch ---
const ToggleSwitch = ({
  enabled,
  onToggle,
  disabled = false
}: {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}) => <button onClick={disabled ? undefined : onToggle} className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${enabled ? 'bg-pink-500' : 'bg-gray-200'} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`} aria-label="toggle">
    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
  </button>;

// --- Detail Header (replaces main header in detail views) ---
const DetailHeader = ({
  onBack,
  backLabel,
  onShare
}: {
  onBack: () => void;
  backLabel: string;
  onShare?: () => void;
}) => <div className="sticky top-0 z-50 bg-white border-b border-gray-100 flex items-center justify-between px-4 h-14 shrink-0">
    <button onClick={onBack} className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition-colors min-w-[60px]">
      <ArrowLeft size={17} />
      <span className="text-[13px] font-semibold">{backLabel}</span>
    </button>
    <h2 className="text-[18px] font-black tracking-tight text-gray-900">
      <span className="text-pink-500">K</span>
      <span className="text-gray-800"> WAVE</span>
    </h2>
    <button onClick={onShare} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-400 min-w-[36px]" aria-label="공유">
      <Share2 size={17} />
    </button>
  </div>;

// --- Main Component ---
export const ContentFeed = ({
  initialArticleId,
  scrollContainerRef
}: {
  initialArticleId?: string;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [lang, setLang] = useState<Lang>('ko');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [activeChip, setActiveChip] = useState('all');
  const [selectedThread, setSelectedThread] = useState<CommunityThread | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(initialArticleId ? ARTICLES.find(a => a.id === initialArticleId) ?? null : null);
  const [commentInput, setCommentInput] = useState('');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [likedArticles, setLikedArticles] = useState<Set<string>>(new Set());
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Set<string>>(new Set(['a2']));
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchView, setSearchView] = useState<'discovery' | 'results'>('discovery');
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [profileSubTab, setProfileSubTab] = useState<ProfileSubTab>('bookmarks');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [likedArticleComments, setLikedArticleComments] = useState<Set<string>>(new Set());
  const [kbotMessages, setKbotMessages] = useState<KBotMessage[]>([]);
  const [kbotInput, setKbotInput] = useState('');
  const [kbotTyping, setKbotTyping] = useState(false);
  const [feedExpanded, setFeedExpanded] = useState(false);
  const [hotGridSeed, setHotGridSeed] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [commentSort, setCommentSort] = useState<'latest' | 'popular'>('latest');
  const [featuredBannerIndex, setFeaturedBannerIndex] = useState(0);
  const [communityCardPage, setCommunityCardPage] = useState(0);
  const [isRefreshSpinning, setIsRefreshSpinning] = useState(false);
  const [liveTickIdx, setLiveTickIdx] = useState(0);
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [shuffledThreads] = useState<CommunityThread[]>(() => [...COMMUNITY_THREADS].sort(() => Math.random() - 0.5));
  const kbotScrollRef = useRef<HTMLDivElement>(null);
  const kbotInputRef = useRef<HTMLInputElement>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const liveTickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '가이아',
    handle: 'jinee_j',
    bio: '🌊 K-컬처 전도사 | K-POP & K-드라마 광팬 | 아미 7년차',
    country: 'kr',
    avatar: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200&h=200&fit=crop'
  });
  const [editDraft, setEditDraft] = useState<ProfileData>(profileData);
  const [showEmojiAvatarPicker, setShowEmojiAvatarPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCommunityEmojiPicker, setShowCommunityEmojiPicker] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState('fav');
  const [communityEmojiCategory, setCommunityEmojiCategory] = useState('fav');
  const [appSettings, setAppSettings] = useState<SettingsState>({
    pushNotifications: true,
    commentAlerts: true,
    trendingAlerts: false,
    darkMode: false,
    privateAccount: false,
    showActivity: true
  });
  const searchInputRef = useRef<HTMLInputElement>(null);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const currentLangOption = LANG_OPTIONS.find(l => l.id === lang)!;

  // Auto-rotate featured banner
  useEffect(() => {
    bannerTimerRef.current = setInterval(() => {
      setFeaturedBannerIndex(prev => (prev + 1) % FEATURED_BANNERS.length);
    }, 4500);
    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    };
  }, []);

  // Auto-rotate live comment ticker
  useEffect(() => {
    liveTickTimerRef.current = setInterval(() => {
      setLiveTickIdx(prev => (prev + 1) % LIVE_COMMENT_TICKS.length);
    }, 2800);
    return () => {
      if (liveTickTimerRef.current) clearInterval(liveTickTimerRef.current);
    };
  }, []);
  const goToBanner = (idx: number) => {
    setFeaturedBannerIndex(idx);
    if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    bannerTimerRef.current = setInterval(() => {
      setFeaturedBannerIndex(prev => (prev + 1) % FEATURED_BANNERS.length);
    }, 4500);
  };

  // Scroll to top when entering article detail
  useEffect(() => {
    if (selectedArticle && scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedArticle]);

  // Scroll to top when entering thread detail
  useEffect(() => {
    if (selectedThread && scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [selectedThread]);

  // Scroll to highlighted comment after thread renders
  useEffect(() => {
    if (highlightedCommentId && highlightRef.current && scrollContainerRef?.current) {
      setTimeout(() => {
        highlightRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
    }
  }, [highlightedCommentId]);

  // Determine if we're in a detail view — hide main header and bottom nav accordingly
  const isDetailView = !!selectedArticle || activeTab === 'community' && !!selectedThread;
  useEffect(() => {
    if (overlay === 'search') setTimeout(() => searchInputRef.current?.focus(), 100);
    if (overlay === 'editProfile') {
      setEditDraft(profileData);
      setShowCountryPicker(false);
    }
    if (overlay === 'kbot') {
      if (kbotMessages.length === 0) setKbotMessages([{
        id: 'welcome',
        role: 'bot',
        text: t(lang, 'kbotWelcome')
      }]);
      setTimeout(() => kbotInputRef.current?.focus(), 200);
    }
  }, [overlay]);
  useEffect(() => {
    if (kbotScrollRef.current) kbotScrollRef.current.scrollTop = kbotScrollRef.current.scrollHeight;
  }, [kbotMessages, kbotTyping]);
  const sendKbotMessage = (text: string) => {
    if (!text.trim()) return;
    setKbotMessages(prev => [...prev, {
      id: `u-${Date.now()}`,
      role: 'user',
      text: text.trim()
    }]);
    setKbotInput('');
    setKbotTyping(true);
    setTimeout(() => {
      setKbotMessages(prev => [...prev, {
        id: `b-${Date.now()}`,
        role: 'bot',
        text: getKbotResponse(text, lang)
      }]);
      setKbotTyping(false);
    }, 900 + Math.random() * 600);
  };
  const toggleLikeComment = (id: string) => setLikedComments(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const toggleLikeArticle = (id: string) => setLikedArticles(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const toggleBookmark = (id: string) => setBookmarkedArticles(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const toggleLikeArticleComment = (id: string) => setLikedArticleComments(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });
  const markAllRead = () => setNotifications(prev => prev.map(n => ({
    ...n,
    isRead: true
  })));
  const saveProfile = () => {
    setProfileData(editDraft);
    setOverlay(null);
  };
  const toggleSetting = (key: keyof SettingsState) => setAppSettings(prev => {
    const next = {
      ...prev,
      [key]: !prev[key]
    };
    if (key === 'pushNotifications') {
      if (!next.pushNotifications) {
        next.commentAlerts = false;
        next.trendingAlerts = false;
      } else {
        next.commentAlerts = true;
        next.trendingAlerts = true;
      }
    }
    return next;
  });
  const filteredByChip = activeChip === 'all' ? ARTICLES : ARTICLES.filter(a => a.categoryKey === activeChip);
  const featuredInChip = filteredByChip.find(a => a.isFeatured) ?? filteredByChip[0];
  const regularInChip = featuredInChip ? ARTICLES.filter(a => a.id !== featuredInChip.id) : [];
  const searchFilteredArticles = searchQuery.trim() ? ARTICLES.filter(a => a.title[lang].toLowerCase().includes(searchQuery.toLowerCase()) || a.category.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const searchFilteredThreads = searchQuery.trim() ? COMMUNITY_THREADS.filter(t => t.topicTitle[lang].toLowerCase().includes(searchQuery.toLowerCase()) || t.topicSummary[lang].toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase())) : [];
  const hasSearchResults = searchFilteredArticles.length > 0 || searchFilteredThreads.length > 0;
  const bookmarkedList = ARTICLES.filter(a => bookmarkedArticles.has(a.id));
  const showBottomNav = !isDetailView;
  const selectedCountry = COUNTRY_OPTIONS.find(c => c.value === editDraft.country) ?? COUNTRY_OPTIONS[0];
  return <div className="max-w-[480px] mx-auto min-h-screen bg-[#f7f7f8] font-sans flex flex-col">

      {/* ── Main Header — hidden in detail views ── */}
      {!isDetailView && <header className="sticky top-0 z-50 bg-white shadow-sm">
          <div className="flex items-center justify-between px-4 h-14">
            <h1 className="text-[22px] font-black tracking-tight text-gray-900">
              <span className="text-pink-500">K</span>
              <span className="text-gray-300">·</span>
              <span>WAVE</span>
            </h1>
            <div className="flex items-center gap-0.5">
              <div className="relative">
                <button onClick={() => setShowLangMenu(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors mr-1">
                  <Globe size={13} className="text-gray-400" />
                  <span className="text-[12px] font-semibold text-gray-600">{currentLangOption.flag} {currentLangOption.label}</span>
                </button>
                <AnimatePresence>
                  {showLangMenu && <motion.div initial={{
                opacity: 0,
                y: -6,
                scale: 0.96
              }} animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }} exit={{
                opacity: 0,
                y: -6,
                scale: 0.96
              }} transition={{
                duration: 0.14
              }} className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 min-w-[148px]">
                      {LANG_OPTIONS.map(opt => <button key={opt.id} onClick={() => {
                  setLang(opt.id);
                  setShowLangMenu(false);
                }} className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium transition-colors ${lang === opt.id ? 'bg-pink-50 text-pink-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                          <span>{opt.flag}</span>
                          <span>{opt.label}</span>
                          {lang === opt.id && <span className="ml-auto w-1.5 h-1.5 bg-pink-500 rounded-full" />}
                        </button>)}
                    </motion.div>}
                </AnimatePresence>
              </div>
              <button onClick={() => setOverlay('search')} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-500" aria-label="검색">
                <Search size={19} />
              </button>
              <button onClick={() => setOverlay('notifications')} className="w-9 h-9 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-500 relative" aria-label="알림">
                <Bell size={19} />
                {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-[9px] font-black text-white leading-none">{unreadCount}</span>
                  </span>}
              </button>
            </div>
          </div>
        </header>}

      {/* ── Search Overlay ── */}
      <AnimatePresence>
        {overlay === 'search' && <motion.div initial={{
        opacity: 0,
        y: -8
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -8
      }} transition={{
        duration: 0.2
      }} className="fixed inset-0 z-[100] bg-[#f7f7f8] flex flex-col max-w-[480px] mx-auto">
            {/* Search Header */}
            <div className="bg-white shrink-0">
              <div className="flex items-center gap-2 px-3 pt-4 pb-3">
                {/* 뒤로가기 */}
                <button onClick={() => {
                  setOverlay(null);
                  setSearchQuery('');
                  setSearchView('discovery');
                }} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shrink-0">
                  <ArrowLeft size={20} className="text-gray-700" />
                </button>
                {/* 검색 인풋 */}
                <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.15, delay: 0.05 }} className="flex-1 flex items-center bg-gray-100 rounded-2xl px-4 py-2.5 gap-2.5 border border-transparent focus-within:border-pink-300 focus-within:bg-white transition-all">
                  <input ref={searchInputRef} type="text" value={searchQuery} onChange={e => {
                    setSearchQuery(e.target.value);
                    setSearchView(e.target.value.trim() ? 'results' : 'discovery');
                  }} placeholder={t(lang, 'searchPlaceholder')} className="flex-1 bg-transparent text-[14px] text-gray-900 outline-none placeholder:text-gray-400 font-medium" />
                  <AnimatePresence>
                    {searchQuery && <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ duration: 0.1 }} onClick={() => {
                      setSearchQuery('');
                      setSearchView('discovery');
                    }} className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors shrink-0">
                      <X size={11} className="text-white" />
                    </motion.button>}
                  </AnimatePresence>
                </motion.div>
                {/* 검색 실행 아이콘 */}
                <button className="w-9 h-9 flex items-center justify-center rounded-full bg-pink-500 hover:bg-pink-600 transition-colors shrink-0">
                  <Search size={17} className="text-white" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* 화면 준비중 */}
              <div className="flex flex-col items-center justify-center h-full py-32 px-8 text-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search size={24} className="text-gray-300" />
                </div>
                <p className="text-[15px] font-bold text-gray-400">{lang === 'ko' ? '화면 준비중입니다' : lang === 'ja' ? '画面準備中です' : lang === 'vi' ? 'Màn hình đang được chuẩn bị' : 'Coming soon'}</p>
              </div>
              <AnimatePresence mode="wait">
                {false ? <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    {hasSearchResults ? <div className="pb-6">
                        {/* 검색 결과 헤더 */}
                        <div className="px-4 pt-4 pb-3">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            {lang === 'ko' ? `"${searchQuery}" 검색 결과` : lang === 'ja' ? `"${searchQuery}" の検索結果` : lang === 'vi' ? `Kết quả cho "${searchQuery}"` : `Results for "${searchQuery}"`}
                          </p>
                        </div>

                        {/* 뉴스 섹션 */}
                        {searchFilteredArticles.length > 0 && <div className="mb-5">
                          <div className="px-4 pb-2 flex items-center gap-2">
                            <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">{lang === 'ko' ? '뉴스' : lang === 'ja' ? 'ニュース' : lang === 'vi' ? 'Tin tức' : 'News'}</span>
                            <span className="text-[10px] font-bold text-pink-400 bg-pink-50 px-2 py-0.5 rounded-full">{searchFilteredArticles.length}</span>
                          </div>
                          <div className="px-4 flex flex-col gap-2.5">
                            {searchFilteredArticles.map((article, idx) => <motion.button key={article.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: 0.04 * idx }} onClick={() => {
                              setSelectedArticle(article);
                              setOverlay(null);
                              setActiveTab('home');
                              setSearchQuery('');
                            }} className="w-full text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex hover:shadow-md transition-all active:scale-[0.98]">
                              <figure className="shrink-0 w-[100px] h-[84px] overflow-hidden bg-gray-100">
                                <img src={article.image} alt={article.title[lang]} className="w-full h-full object-cover" />
                              </figure>
                              <div className="flex-1 min-w-0 px-3.5 py-3">
                                <span className={`${article.categoryColor} text-white text-[9px] font-black px-2 py-0.5 rounded-full`}>{article.category}</span>
                                <p className="text-[13px] font-bold text-gray-900 leading-snug mt-1.5 mb-1 line-clamp-2">{article.title[lang]}</p>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                                    <span className="font-medium text-gray-500">{article.source[lang]}</span>
                                    <span>·</span>
                                    <span>{article.timeAgo[lang]}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-300">
                                    <span className="flex items-center gap-0.5 text-[10px]"><Heart size={10} /><span>{article.likes.toLocaleString()}</span></span>
                                  </div>
                                </div>
                              </div>
                            </motion.button>)}
                          </div>
                        </div>}

                        {/* 커뮤니티 섹션 */}
                        {searchFilteredThreads.length > 0 && <div>
                          <div className="px-4 pb-2 flex items-center gap-2">
                            <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest">{lang === 'ko' ? '커뮤니티' : lang === 'ja' ? 'コミュニティ' : lang === 'vi' ? 'Cộng đồng' : 'Community'}</span>
                            <span className="text-[10px] font-bold text-pink-400 bg-pink-50 px-2 py-0.5 rounded-full">{searchFilteredThreads.length}</span>
                          </div>
                          <div className="px-4 flex flex-col gap-2.5">
                            {searchFilteredThreads.map((thread, idx) => <motion.button key={thread.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15, delay: 0.04 * idx }} onClick={() => {
                              setSelectedThread(thread);
                              setOverlay(null);
                              setActiveTab('community');
                              setSearchQuery('');
                            }} className="w-full text-left bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all active:scale-[0.98]">
                              <div className="px-4 py-3.5">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`text-white text-[9px] font-black px-2 py-0.5 rounded-full ${thread.categoryColor}`}>{thread.category}</span>
                                  <span className="text-[10px] text-gray-400 flex items-center gap-1"><MessageCircle size={9} />{lang === 'ko' ? `${thread.commentCount}명 참여중` : `${thread.commentCount} participating`}</span>
                                </div>
                                <p className="text-[13px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1">{thread.topicTitle[lang]}</p>
                                <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{thread.topicSummary[lang]}</p>
                              </div>
                            </motion.button>)}
                          </div>
                        </div>}
                      </div>

                    : <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }} className="w-16 h-16 rounded-full bg-pink-50 flex items-center justify-center mb-4">
                          <Search size={28} className="text-pink-300" />
                        </motion.div>
                        <p className="text-[16px] font-black text-gray-800 mb-1">{t(lang, 'noResults')}</p>
                        <p className="text-[13px] text-gray-400 leading-relaxed mb-6">
                          {lang === 'ko' ? `"${searchQuery}"에 대한 결과를 찾지 못했어요` : lang === 'ja' ? `"${searchQuery}"の結果が見つかりません` : lang === 'vi' ? `Không tìm thấy kết quả cho "${searchQuery}"` : `No results found for "${searchQuery}"`}
                        </p>
                        <div className="w-full">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                            {lang === 'ko' ? '이런 건 어때요?' : lang === 'ja' ? 'こちらはいかがですか？' : lang === 'vi' ? 'Thử tìm kiếm này nhé' : 'Try these instead'}
                          </p>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {TRENDING_SEARCHES.map(item => <button key={item.id} onClick={() => setSearchQuery(item.label[lang])} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-gray-200 text-[12px] font-semibold text-gray-600 hover:border-pink-300 hover:text-pink-500 transition-colors shadow-sm">
                                <TrendingUp size={10} className="text-pink-400" />
                                <span>{item.label[lang]}</span>
                              </button>)}
                          </div>
                        </div>
                      </div>}
                  </motion.div> : <motion.div key="discovery" initial={{
              opacity: 0
            }} animate={{
              opacity: 1
            }} exit={{
              opacity: 0
            }} transition={{
              duration: 0.15
            }} className="px-4 pt-5 flex flex-col gap-7">
                    <div>
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-gray-400" />
                          <h2 className="text-[12px] font-black text-gray-500 uppercase tracking-widest">{t(lang, 'recentSearches')}</h2>
                        </div>
                        <button className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors">
                          {lang === 'ko' ? '전체 삭제' : lang === 'ja' ? '全て削除' : lang === 'vi' ? 'Xóa tất cả' : 'Clear all'}
                        </button>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {RECENT_SEARCHES.map(item => {
                    return <div key={item.id} className="flex items-center gap-3 py-2 px-3 rounded-2xl hover:bg-white transition-colors group cursor-pointer" onClick={() => setSearchQuery(item.label[lang])}>
                              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                                <Clock size={14} className="text-gray-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-gray-800 truncate">{item.label[lang]}</p>
                              </div>
                              <button className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-all shrink-0" onClick={e => e.stopPropagation()}>
                                <X size={13} />
                              </button>
                            </div>;
                  })}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-3.5">
                        <Flame size={13} className="text-pink-500" />
                        <h2 className="text-[12px] font-black text-gray-500 uppercase tracking-widest">{t(lang, 'trendingSearches')}</h2>
                      </div>
                      <div className="flex flex-col gap-1">
                        {TRENDING_SEARCHES.map((item, idx) => <button key={item.id} onClick={() => setSearchQuery(item.label[lang])} className="flex items-center gap-3.5 py-3 px-3 rounded-2xl hover:bg-white transition-colors group text-left">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[13px] font-black ${idx === 0 ? 'bg-pink-50 text-pink-500' : idx === 1 ? 'bg-orange-50 text-orange-500' : idx === 2 ? 'bg-amber-50 text-amber-500' : 'bg-gray-100 text-gray-400'}`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-gray-800">{item.label[lang]}</p>
                            </div>
                            <div className={`flex items-center gap-1 ${idx < 3 ? 'text-pink-400' : 'text-gray-300'}`}>
                              <TrendingUp size={12} />
                            </div>
                          </button>)}
                      </div>
                    </div>
                  </motion.div>}
              </AnimatePresence>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* ── Notifications Overlay ── */}
      <AnimatePresence>
        {overlay === 'notifications' && <motion.div initial={{
        opacity: 0,
        y: -8
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: -8
      }} transition={{
        duration: 0.18
      }} className="fixed inset-0 z-[100] bg-white flex flex-col max-w-[480px] mx-auto">
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <button onClick={() => setOverlay(null)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-500"><ArrowLeft size={18} /></button>
                <h2 className="text-[16px] font-black text-gray-900">{t(lang, 'notifications')}</h2>
                {unreadCount > 0 && <span className="px-2 py-0.5 bg-pink-500 text-white text-[11px] font-black rounded-full">{unreadCount}</span>}
              </div>
              {unreadCount > 0 && <button onClick={markAllRead} className="text-[12px] font-semibold text-pink-500">{t(lang, 'allRead')}</button>}
            </div>
            <div className="flex-1 overflow-y-auto">
              {notifications.map(notif => <div key={notif.id} className={`flex items-start gap-3 px-4 py-3.5 border-b border-gray-50 transition-colors ${!notif.isRead ? 'bg-pink-50/60' : 'bg-white'}`}>
                  {notif.type === 'trending' ? <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shrink-0"><TrendingUp size={16} className="text-white" /></div> : <div className="relative shrink-0">
                      <img src={notif.avatar} alt="user avatar" className="w-10 h-10 rounded-full object-cover border border-gray-100" />
                      <span className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${notif.type === 'like' ? 'bg-red-500' : 'bg-blue-500'}`}>
                        {notif.type === 'like' ? <Heart size={10} className="fill-red-500" /> : <MessageCircle size={10} />}
                      </span>
                    </div>}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-gray-800 leading-relaxed">{notif.message[lang]}</p>
                    <span className="text-[11px] text-gray-400 mt-0.5 block">{notif.timeAgo}</span>
                  </div>
                  {!notif.isRead && <span className="w-2 h-2 bg-pink-500 rounded-full shrink-0 mt-1.5" />}
                </div>)}
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* ── K봇 Overlay ── */}
      <AnimatePresence>
        {overlay === 'kbot' && <motion.div initial={{
        opacity: 0,
        y: 30
      }} animate={{
        opacity: 1,
        y: 0
      }} exit={{
        opacity: 0,
        y: 30
      }} transition={{
        duration: 0.24,
        ease: 'easeOut'
      }} className="fixed inset-0 z-[100] bg-[#f7f7f8] flex flex-col max-w-[480px] mx-auto">
            <div className="bg-white border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3 px-4 h-14">
                <button onClick={() => setOverlay('settings')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-500"><ArrowLeft size={18} /></button>
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[14px] font-black text-gray-900 leading-none">{t(lang, 'kbotTitle')}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{t(lang, 'kbotSubtitle')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 rounded-full">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  <span className="text-[10px] font-bold text-green-600">ONLINE</span>
                </div>
              </div>
            </div>
            <div ref={kbotScrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              {kbotMessages.map(msg => <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.role === 'bot' && <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={13} className="text-white" />
                    </div>}
                  <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-line ${msg.role === 'bot' ? 'bg-white text-gray-800 rounded-tl-sm shadow-sm border border-gray-100' : 'bg-pink-500 text-white rounded-tr-sm'}`}>
                    {msg.text}
                  </div>
                </div>)}
              {kbotTyping && <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shrink-0"><Bot size={13} className="text-white" /></div>
                  <div className="bg-white border border-gray-100 shadow-sm px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{
                animationDelay: '0ms'
              }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{
                animationDelay: '150ms'
              }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{
                animationDelay: '300ms'
              }} />
                  </div>
                </div>}
              {kbotMessages.length <= 1 && !kbotTyping && <div className="mt-2">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles size={12} className="text-pink-400" />
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                      {lang === 'ko' ? '빠른 질문' : lang === 'ja' ? 'クイック質問' : lang === 'vi' ? 'Câu hỏi nhanh' : 'Quick Questions'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {KBOT_SUGGESTIONS.map(s => <button key={s.id} onClick={() => sendKbotMessage(t(lang, s.key))} className="px-3 py-2 bg-white border border-pink-100 rounded-full text-[12px] font-medium text-pink-600 hover:bg-pink-50 transition-colors shadow-sm">
                        {t(lang, s.key)}
                      </button>)}
                  </div>
                </div>}
            </div>
            <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5 gap-2">
                  <input ref={kbotInputRef} type="text" value={kbotInput} onChange={e => setKbotInput(e.target.value)} onKeyDown={e => {
                if (e.key === 'Enter') sendKbotMessage(kbotInput);
              }} placeholder={t(lang, 'kbotPlaceholder')} className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400" />
                </div>
                <button onClick={() => sendKbotMessage(kbotInput)} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${kbotInput.trim() ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-gray-100 text-gray-300'}`}>
                  <Send size={15} />
                </button>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* ── Edit Profile Overlay ── */}
      <AnimatePresence>
        {overlay === 'editProfile' && <motion.div initial={{
        opacity: 0,
        x: 40
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0,
        x: 40
      }} transition={{
        duration: 0.22,
        ease: 'easeOut'
      }} className="fixed inset-0 z-[100] bg-white flex flex-col max-w-[480px] mx-auto">
            <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 shrink-0">
              <button onClick={() => setOverlay(null)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-500"><X size={18} /></button>
              <h2 className="text-[16px] font-black text-gray-900">{t(lang, 'editProfileTitle')}</h2>
              <button onClick={saveProfile} className="px-4 py-1.5 bg-pink-500 text-white text-[13px] font-bold rounded-full hover:bg-pink-600 transition-colors">{t(lang, 'save')}</button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col items-center pt-8 pb-5 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white">
                <div className="relative mb-3">
                  <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-gradient-to-br from-pink-300 to-violet-400 flex items-center justify-center shadow-lg">
                    {editDraft.avatar && !editDraft.avatar.startsWith('emoji:') ? <img src={editDraft.avatar} alt="Profile avatar" className="w-full h-full object-cover" /> : editDraft.avatar && editDraft.avatar.startsWith('emoji:') ? <span className="text-4xl leading-none">{editDraft.avatar.replace('emoji:', '')}</span> : <img src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200&h=200&fit=crop" alt="Profile avatar" className="w-full h-full object-cover" />}
                  </div>
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center border-2 border-white shadow cursor-pointer">
                    <Camera size={14} className="text-white" />
                    <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setEditDraft(prev => ({
                      ...prev,
                      avatar: url
                    }));
                    setShowEmojiAvatarPicker(false);
                  }
                }} />
                  </label>
                </div>
                <div className="flex items-center justify-center mt-1">
                  <button onClick={() => setShowEmojiAvatarPicker(v => !v)} className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-[12px] font-semibold transition-colors ${showEmojiAvatarPicker ? 'border-pink-300 bg-pink-50 text-pink-600' : 'border-gray-200 bg-gray-50 hover:bg-pink-50 hover:border-pink-200 text-gray-600 hover:text-pink-600'}`}>
                    <span className="text-[13px]">🐾</span>
                    <span>{lang === 'ko' ? '기본 아바타로 변경' : lang === 'ja' ? 'デフォルトアバターに変更' : lang === 'vi' ? 'Đổi avatar mặc định' : 'Default Avatar'}</span>
                  </button>
                </div>
                <AnimatePresence>
                  {showEmojiAvatarPicker && <motion.div initial={{
                opacity: 0,
                y: -8,
                scale: 0.97
              }} animate={{
                opacity: 1,
                y: 0,
                scale: 1
              }} exit={{
                opacity: 0,
                y: -8,
                scale: 0.97
              }} transition={{
                duration: 0.15
              }} className="mt-3 w-full px-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-2">
                        {lang === 'ko' ? '이모지 아바타 선택' : lang === 'ja' ? '絵文字アバターを選択' : lang === 'vi' ? 'Chọn avatar emoji' : 'Pick an emoji avatar'}
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {EMOJI_AVATARS.map(ea => <button key={ea.id} onClick={() => {
                    setEditDraft(prev => ({
                      ...prev,
                      avatar: `emoji:${ea.emoji}`
                    }));
                    setShowEmojiAvatarPicker(false);
                  }} className={`w-full aspect-square rounded-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95 ${editDraft.avatar === `emoji:${ea.emoji}` ? 'bg-pink-100 ring-2 ring-pink-400' : 'bg-gray-100 hover:bg-pink-50'}`}>
                            {ea.emoji}
                          </button>)}
                      </div>
                    </motion.div>}
                </AnimatePresence>
              </div>
              <div className="px-5 py-6 flex flex-col gap-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t(lang, 'name')}</label>
                  <input type="text" value={editDraft.name} onChange={e => setEditDraft(prev => ({
                ...prev,
                name: e.target.value
              }))} placeholder={t(lang, 'namePlaceholder')} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-[14px] text-gray-900 font-medium outline-none focus:ring-2 focus:ring-pink-300 border border-gray-100 transition-all" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t(lang, 'handle')}</label>
                  <div className="flex items-center bg-gray-50 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-pink-300 transition-all overflow-hidden">
                    <span className="pl-4 text-[14px] text-gray-400 font-medium select-none">@</span>
                    <input type="text" value={editDraft.handle} onChange={e => setEditDraft(prev => ({
                  ...prev,
                  handle: e.target.value
                }))} placeholder={t(lang, 'handlePlaceholder')} className="flex-1 px-2 py-3 bg-transparent text-[14px] text-gray-900 font-medium outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t(lang, 'bio')}</label>
                  <textarea value={editDraft.bio} onChange={e => setEditDraft(prev => ({
                ...prev,
                bio: e.target.value
              }))} placeholder={t(lang, 'bioPlaceholder')} rows={3} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-[14px] text-gray-900 font-medium outline-none focus:ring-2 focus:ring-pink-300 border border-gray-100 transition-all resize-none" />
                  <p className="text-[11px] text-gray-400 mt-1 text-right">{editDraft.bio.length} / 150</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">{t(lang, 'country')}</label>
                  <button onClick={() => setShowCountryPicker(v => !v)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-pink-300 transition-all">
                    <span className="flex items-center gap-2 text-[14px] font-medium text-gray-900">
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.label}</span>
                    </span>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${showCountryPicker ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {showCountryPicker && <motion.div initial={{
                  opacity: 0,
                  y: -6
                }} animate={{
                  opacity: 1,
                  y: 0
                }} exit={{
                  opacity: 0,
                  y: -6
                }} transition={{
                  duration: 0.12
                }} className="mt-1.5 bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
                        {COUNTRY_OPTIONS.map(opt => <button key={opt.value} onClick={() => {
                    setEditDraft(prev => ({
                      ...prev,
                      country: opt.value
                    }));
                    setShowCountryPicker(false);
                  }} className={`w-full flex items-center gap-3 px-4 py-3 text-[13px] font-medium transition-colors text-left ${editDraft.country === opt.value ? 'bg-pink-50 text-pink-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                            <span>{opt.flag}</span>
                            <span>{opt.label}</span>
                            {editDraft.country === opt.value && <span className="ml-auto w-1.5 h-1.5 bg-pink-500 rounded-full" />}
                          </button>)}
                      </motion.div>}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* ── Settings Overlay ── */}
      <AnimatePresence>
        {overlay === 'settings' && <motion.div initial={{
        opacity: 0,
        x: 40
      }} animate={{
        opacity: 1,
        x: 0
      }} exit={{
        opacity: 0,
        x: 40
      }} transition={{
        duration: 0.22,
        ease: 'easeOut'
      }} className="fixed inset-0 z-[100] bg-[#f7f7f8] flex flex-col max-w-[480px] mx-auto">
            <div className="flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-100 shrink-0">
              <button onClick={() => setOverlay(null)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors text-gray-500"><ArrowLeft size={18} /></button>
              <h2 className="text-[16px] font-black text-gray-900">{t(lang, 'settingsTitle')}</h2>
            </div>
            <div className="flex-1 overflow-y-auto py-5 flex flex-col gap-5 px-4">
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{t(lang, 'notificationSettings')}</p>
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="flex items-center justify-between px-4 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-pink-50 flex items-center justify-center shrink-0"><BellIcon size={16} className="text-pink-500" /></div>
                      <div><p className="text-[13px] font-semibold text-gray-800">{t(lang, 'pushNotifications')}</p><p className="text-[11px] text-gray-400 mt-0.5">{t(lang, 'pushNotificationsDesc')}</p></div>
                    </div>
                    <ToggleSwitch enabled={appSettings.pushNotifications} onToggle={() => toggleSetting('pushNotifications')} />
                  </div>
                  <div className="flex items-center justify-between px-4 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><MessageCircle size={16} className="text-blue-500" /></div>
                      <div><p className="text-[13px] font-semibold text-gray-800">{t(lang, 'commentAlerts')}</p><p className="text-[11px] text-gray-400 mt-0.5">{t(lang, 'commentAlertsDesc')}</p></div>
                    </div>
                    <ToggleSwitch enabled={appSettings.commentAlerts} onToggle={() => toggleSetting('commentAlerts')} />
                  </div>
                  <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0"><Flame size={16} className="text-orange-500" /></div>
                      <div><p className="text-[13px] font-semibold text-gray-800">{t(lang, 'trendingAlerts')}</p><p className="text-[11px] text-gray-400 mt-0.5">{t(lang, 'trendingAlertsDesc')}</p></div>
                    </div>
                    <ToggleSwitch enabled={appSettings.trendingAlerts} onToggle={() => toggleSetting('trendingAlerts')} />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{t(lang, 'displaySettings')}</p>
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><Moon size={16} className="text-gray-500" /></div>
                      <div><p className="text-[13px] font-semibold text-gray-800">{t(lang, 'darkMode')}</p><p className="text-[11px] text-gray-400 mt-0.5">{t(lang, 'darkModeDesc')}</p></div>
                    </div>
                    <ToggleSwitch enabled={appSettings.darkMode} onToggle={() => toggleSetting('darkMode')} disabled />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{t(lang, 'privacySettings')}</p>
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <div className="flex items-center justify-between px-4 py-4 border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-violet-50 flex items-center justify-center shrink-0"><Shield size={16} className="text-violet-500" /></div>
                      <div><p className="text-[13px] font-semibold text-gray-800">{t(lang, 'privateAccount')}</p><p className="text-[11px] text-gray-400 mt-0.5">{t(lang, 'privateAccountDesc')}</p></div>
                    </div>
                    <ToggleSwitch enabled={appSettings.privateAccount} onToggle={() => toggleSetting('privateAccount')} />
                  </div>
                  <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center shrink-0"><Eye size={16} className="text-green-500" /></div>
                      <div><p className="text-[13px] font-semibold text-gray-800">{t(lang, 'showActivity')}</p><p className="text-[11px] text-gray-400 mt-0.5">{t(lang, 'showActivityDesc')}</p></div>
                    </div>
                    <ToggleSwitch enabled={appSettings.showActivity} onToggle={() => toggleSetting('showActivity')} />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{t(lang, 'accountSettings')}</p>
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                  <button onClick={() => setOverlay('kbot')} className="w-full flex items-center gap-3 px-4 py-4 border-b border-gray-50 hover:bg-pink-50/60 transition-colors text-left">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center shrink-0"><Bot size={16} className="text-white" /></div>
                    <div><p className="text-[13px] font-semibold text-gray-800">{t(lang, 'kbot')}</p><p className="text-[11px] text-gray-400 mt-0.5">{t(lang, 'kbotSubtitle')}</p></div>
                    <div className="flex items-center gap-1.5 ml-auto"><span className="w-1.5 h-1.5 bg-green-400 rounded-full" /><ChevronRight size={15} className="text-gray-300" /></div>
                  </button>
                  <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0"><Smartphone size={16} className="text-gray-500" /></div>
                      <div><p className="text-[13px] font-semibold text-gray-800">{t(lang, 'appVersion')}</p><p className="text-[11px] text-gray-400 mt-0.5">v2.4.1</p></div>
                    </div>
                  </div>
                  <button className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 transition-colors text-red-400">
                    <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0"><Trash2 size={16} className="text-red-400" /></div>
                    <div><p className="text-[13px] font-semibold text-red-400">{t(lang, 'deleteAccount')}</p><p className="text-[11px] text-red-300 mt-0.5">{t(lang, 'deleteAccountDesc')}</p></div>
                  </button>
                </div>
              </div>
              <button className="w-full flex items-center justify-center gap-2 py-3.5 bg-white rounded-2xl border border-gray-100 hover:bg-red-50 transition-colors text-red-400">
                <LogOut size={16} />
                <span className="text-[13px] font-bold">{t(lang, 'logout')}</span>
              </button>
              <p className="text-center text-[11px] text-gray-300 pb-2">K·WAVE · {lang === 'ko' ? '모든 권리 보유' : lang === 'ja' ? '全著作権所有' : lang === 'vi' ? 'Bảo lưu mọi quyền' : 'All rights reserved'}</p>
            </div>
          </motion.div>}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="flex-1 pb-[60px]">
        <AnimatePresence mode="wait">

          {/* ════ HOME TAB ════ */}
          {activeTab === 'home' && !selectedArticle && <motion.div key="home" initial={{
          opacity: 0,
          x: -10
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: 10
        }} transition={{
          duration: 0.18
        }}>
              <div className="px-4 py-3 bg-white border-b border-gray-100 flex gap-2 overflow-x-auto" style={{
            scrollbarWidth: 'none'
          }}>
                {CATEGORY_CHIPS.map(chip => <button key={chip.id} onClick={() => setActiveChip(chip.id)} className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all border ${activeChip === chip.id ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                    {chip.label[lang]}
                  </button>)}
              </div>
              {filteredByChip.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Grid3X3 size={36} className="mb-3 opacity-30" />
                  <p className="text-[14px]">{t(lang, 'noResults')}</p>
                </div> : <div>

                  {/* ── Featured Banner Carousel (3 slides) ── */}
                  {activeChip === 'all' && <div className="relative bg-white mb-2 overflow-hidden">
                      <div className="relative h-[220px] overflow-hidden">
                        <AnimatePresence mode="wait">
                          {FEATURED_BANNERS.map((banner, bIdx) => bIdx === featuredBannerIndex ? <motion.div key={banner.id} initial={{
                    opacity: 0,
                    x: 40
                  }} animate={{
                    opacity: 1,
                    x: 0
                  }} exit={{
                    opacity: 0,
                    x: -40
                  }} transition={{
                    duration: 0.35,
                    ease: 'easeInOut'
                  }} className="absolute inset-0 cursor-pointer" onClick={() => {
                    if (banner.type === 'news' && banner.articleId) {
                      const a = ARTICLES.find(ar => ar.id === banner.articleId);
                      if (a) setSelectedArticle(a);
                    }
                  }}>
                              <img src={banner.image} alt={banner.title[lang]} className="w-full h-full object-cover" />
                              <div className={`absolute inset-0 bg-gradient-to-t ${banner.gradientFrom} ${banner.gradientTo} opacity-60`} />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                              {/* Top badges */}
                              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                                <span className={`text-white text-[10px] font-black px-2.5 py-1 rounded-full ${banner.type === 'ad' ? 'bg-emerald-500' : 'bg-black/50 backdrop-blur-sm'}`}>
                                  {banner.badge ? banner.badge[lang] : ''}
                                </span>
                                {banner.type === 'news' && banner.categoryColor && <span className={`${banner.categoryColor} text-white text-[10px] font-black px-2.5 py-1 rounded-full`}>{banner.category}</span>}
                                {banner.type === 'ad' && <span className="bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/30">{banner.adBrand}</span>}
                              </div>
                              {/* Bottom content */}
                              <div className="absolute bottom-4 left-0 right-0 px-4 pb-2 pt-8">
                                {banner.type === 'ad' ? <div>
                                    <p className="text-white font-black text-[17px] leading-snug mb-1 whitespace-pre-line">{banner.title[lang]}</p>
                                    <div className="flex items-center justify-between mt-2">
                                      <p className="text-white/80 text-[12px] font-medium">{banner.subtitle ? banner.subtitle[lang] : ''}</p>
                                      <span className="bg-white text-emerald-600 text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg">
                                        {banner.adCta ? banner.adCta[lang] : ''}
                                      </span>
                                    </div>
                                  </div> : <div>
                                    <h2 className="text-white font-black text-[16px] leading-snug line-clamp-1 mb-1">{banner.title[lang]}</h2>
                                    {banner.subtitle && <p className="text-white/70 text-[11px] font-medium leading-snug line-clamp-2">{banner.subtitle[lang]}</p>}
                                  </div>}
                              </div>
                            </motion.div> : null)}
                        </AnimatePresence>
                        {/* Prev/Next arrows removed */}
                      </div>
                      {/* Dot indicators */}
                      <div className="flex items-center justify-center gap-1.5 py-2.5 bg-white">
                        {FEATURED_BANNERS.map((banner, bIdx) => <button key={banner.id} onClick={() => goToBanner(bIdx)} className={`rounded-full transition-all duration-300 ${bIdx === featuredBannerIndex ? 'w-5 h-1.5 bg-pink-500' : 'w-1.5 h-1.5 bg-gray-200'}`} aria-label={`배너 ${bIdx + 1}`} />)}
                      </div>
                    </div>}

                  {/* Keep original featuredInChip for non-all chip views */}
                  {activeChip !== 'all' && featuredInChip && <article onClick={() => setSelectedArticle(featuredInChip)} className="bg-white mb-2 cursor-pointer">
                      <div className="relative overflow-hidden">
                        <img src={featuredInChip.image} alt={featuredInChip.title[lang]} className="w-full h-56 object-cover" />
                        <div className="absolute top-3 left-3">
                          <span className={`${featuredInChip.categoryColor} text-white text-[10px] font-black px-2.5 py-1 rounded-full`}>{featuredInChip.category}</span>
                        </div>
                        {featuredInChip.isFeatured && <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{t(lang, 'featuredLabel')}</div>}
                      </div>
                      <div className="px-4 pt-3 pb-4">
                        <h2 className="text-[16px] font-bold text-gray-900 leading-snug mb-2">{featuredInChip.title[lang]}</h2>
                        <p className="text-[13px] text-gray-500 leading-relaxed mb-3 line-clamp-2">{featuredInChip.body[lang][0]}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[11px] text-gray-400">
                            <span className="font-medium text-gray-500">{featuredInChip.source[lang]}</span>
                            <span>·</span>
                            <span>{featuredInChip.timeAgo[lang]}</span>
                          </div>
                          <button onClick={e => {
                      e.stopPropagation();
                      toggleBookmark(featuredInChip.id);
                    }} className={`transition-colors ${bookmarkedArticles.has(featuredInChip.id) ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
                            <Bookmark size={15} className={bookmarkedArticles.has(featuredInChip.id) ? 'fill-gray-800' : ''} />
                          </button>
                        </div>
                      </div>
                    </article>}

                  {/* ── 카테고리별 숏폼 2×2 그리드 ── */}
                  {activeChip !== 'all' && (() => {
                    const chipCategoryMap: Record<string, string> = { kpop: 'K-POP', kdrama: 'K-DRAMA', kfood: 'K-FOOD', kbeauty: 'K-BEAUTY' };
                    const sfCategory = chipCategoryMap[activeChip];
                    const pool = K_SHORTFORM_LIST.filter(s => s.category === sfCategory);
                    const shuffled = [...pool].sort((a, b) => {
                      const hashA = (a.id.charCodeAt(a.id.length - 1) * 31 + hotGridSeed * 17) % 97;
                      const hashB = (b.id.charCodeAt(b.id.length - 1) * 31 + hotGridSeed * 17) % 97;
                      return hashA - hashB;
                    });
                    const gridItems = shuffled.slice(0, 4);
                    if (gridItems.length === 0) return null;
                    const chip = CATEGORY_CHIPS.find(c => c.id === activeChip);
                    const chipLabel = chip ? chip.label[lang] : activeChip;
                    return (
                      <div className="bg-white mb-2 px-4 pt-5 pb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-[16px] leading-none">🎬</span>
                          <h2 className="text-[15px] font-black text-gray-900">
                            {lang === 'ko' ? `${chipLabel} 숏폼` : lang === 'ja' ? `${chipLabel} ショート` : lang === 'vi' ? `${chipLabel} Shorts` : `${chipLabel} Shorts`}
                          </h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {gridItems.map(item => (
                            <button key={item.id} className="text-left group active:scale-[0.97] transition-transform" style={{minHeight: '230px'}}>
                              <div className="relative w-full rounded-2xl overflow-hidden mb-2 bg-gray-100" style={{height: '160px'}}>
                                <img src={item.thumbnail} alt={item.title[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-10 h-10 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40">
                                    <Play size={16} className="text-white fill-white ml-0.5" />
                                  </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">{item.duration}</div>
                                <div className="absolute top-2 left-2">
                                  <span className={`${item.categoryColor} text-white text-[9px] font-black px-2 py-0.5 rounded-full`}>{item.category}</span>
                                </div>
                              </div>
                              <p className="text-[12px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1">{item.title[lang]}</p>
                              <div className="flex items-center gap-1.5">
                                <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-100 shrink-0">
                                  <img src={item.channelLogo} alt={item.channel} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[10px] text-gray-500 font-medium truncate">{item.channel}</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[10px] text-gray-400">▷ {item.views[lang]}</span>
                                <span className="text-gray-200">·</span>
                                <span className="text-[10px] text-gray-400">{item.timeAgo[lang]}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                        {/* 새로고침 버튼 — 그리드 아래 가운데 */}
                        <div className="flex justify-center mt-4">
                          <button onClick={() => setHotGridSeed(s => s + 1)} className="flex items-center gap-1.5 text-[12px] font-bold text-gray-400 hover:text-pink-500 transition-colors px-4 py-2 rounded-full border border-gray-200 hover:border-pink-300 bg-white hover:bg-pink-50">
                            <RefreshCw size={13} />
                            <span>{lang === 'ko' ? '다른 숏폼 보기' : lang === 'ja' ? '他のショートを見る' : lang === 'vi' ? 'Xem shorts khác' : 'See other shorts'}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── 지금 가장 핫한 뉴스 ── */}
                  {activeChip === 'all' && <div className="mt-2 bg-white mb-2">
                      <div className="flex items-center gap-2 px-4 pt-5 pb-3">
                        <Flame size={17} className="text-red-500" />
                        <h2 className="text-[16px] font-black text-gray-900">
                          {lang === 'ko' ? '지금 가장 핫한 뉴스' : lang === 'ja' ? '今最もホットなニュース' : lang === 'vi' ? 'Tin tức hot nhất lúc này' : 'Trending News Right Now'}
                        </h2>
                      </div>
                      <div className="flex flex-col">
                        {HOT_NEWS_LIST.slice(0, 5).map((item, idx) => <button key={item.id} onClick={() => {
                  const a = ARTICLES.find(ar => ar.id === item.articleId);
                  if (a) setSelectedArticle(a);
                }} className="flex items-center gap-3 px-4 py-3 border-t border-gray-50 hover:bg-gray-50 transition-colors text-left">
                            <span className={`text-[13px] font-black w-5 shrink-0 ${idx === 0 ? 'text-pink-500' : idx === 1 ? 'text-orange-400' : idx === 2 ? 'text-amber-400' : 'text-gray-300'}`}>{idx + 1}</span>
                            <figure className="shrink-0 w-[52px] h-[44px] rounded-lg overflow-hidden bg-gray-100">
                              <img src={item.image} alt={item.title[lang]} className="w-full h-full object-cover" />
                            </figure>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-gray-800 leading-snug line-clamp-2">{item.title[lang]}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{item.source[lang]}</p>
                            </div>
                          </button>)}
                      </div>
                    </div>}

                  {/* ── 오늘의 K-숏폼 ── */}
                  {activeChip === 'all' && <div className="bg-white mb-2">
                      <div className="flex items-center px-4 pt-5 pb-3">
                        <span className="text-[18px] leading-none mr-2">🎬</span>
                        <h2 className="text-[16px] font-black text-gray-900">
                          {lang === 'ko' ? '오늘의 K-숏폼' : lang === 'ja' ? '今日のK-ショート' : lang === 'vi' ? 'K-Short hôm nay' : "Today's K-Shorts"}
                        </h2>
                      </div>
                      <div className="flex gap-3 px-4 pb-5 overflow-x-auto" style={{
                scrollbarWidth: 'none'
              }}>
                        {K_SHORTFORM_LIST.map(item => {
                  const isAd = item.id === 'sf_ad';
                  return <button key={item.id} className="shrink-0 w-[130px] text-left group active:scale-[0.97] transition-transform">
                            <div className={`relative w-full h-[200px] rounded-2xl overflow-hidden mb-2 ${isAd ? 'bg-orange-100' : 'bg-gray-100'}`}>
                              <img src={item.thumbnail} alt={item.title[lang]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                              {isAd && <div className="absolute inset-0 bg-orange-500/20" />}
                              {/* Play button */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center border ${isAd ? 'bg-orange-500/80 border-orange-300/60' : 'bg-white/25 border-white/40'}`}>
                                  <Play size={16} className="text-white fill-white ml-0.5" />
                                </div>
                              </div>
                              {/* Duration badge */}
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                {item.duration}
                              </div>
                              {/* Category badge */}
                              <div className="absolute top-2 left-2">
                                <span className={`${item.categoryColor} text-white text-[9px] font-black px-2 py-0.5 rounded-full`}>{item.category}</span>
                              </div>
                              {isAd && <div className="absolute top-2 right-2 bg-white/90 text-orange-600 text-[9px] font-black px-2 py-0.5 rounded-full">
                                {lang === 'ko' ? '광고' : lang === 'ja' ? '広告' : lang === 'vi' ? 'QC' : 'AD'}
                              </div>}
                            </div>
                            <p className="text-[12px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1">{item.title[lang]}</p>
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-100 shrink-0">
                                <img src={item.channelLogo} alt={item.channel} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] text-gray-500 font-medium truncate">{item.channel}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-gray-400">
                                {isAd ? <span className="text-orange-500 font-bold">{item.views[lang]}</span> : <span><span>▷ </span><span>{item.views[lang]}</span></span>}
                              </span>
                              <span className="text-gray-200">·</span>
                              <span className="text-[10px] text-gray-400">{item.timeAgo[lang]}</span>
                            </div>
                          </button>;
                })}
                      </div>
                    </div>}

                  {regularInChip.length > 0 && <div className="flex flex-col gap-[1px] bg-gray-100">
                      <div className="bg-white flex items-center gap-2 px-4 pt-4 pb-3">
                        <span className="text-[16px]">🕐</span>
                        <h2 className="text-[16px] font-black text-gray-900">
                          {lang === 'ko' ? '실시간 K-뉴스' : lang === 'ja' ? 'リアルタイム K-ニュース' : lang === 'vi' ? 'Tin K-News Thời Gian Thực' : 'Live K-News'}
                        </h2>
                      </div>
                      {(feedExpanded ? regularInChip : regularInChip.slice(0, 4)).map(article => <article key={article.id} onClick={() => setSelectedArticle(article)} className="bg-white px-4 py-4 flex gap-3 cursor-pointer hover:shadow-md transition-shadow border-t border-gray-50">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className={`${article.categoryColor} text-white text-[9px] font-black px-2 py-0.5 rounded-full tracking-wide`}>{article.category}</span>
                            </div>
                            <h3 className="text-[14px] font-bold text-gray-900 leading-snug mb-1.5 line-clamp-2">{article.title[lang]}</h3>
                            <p className="text-[12px] text-gray-400 leading-relaxed line-clamp-2 mb-2">{article.body[lang][0]}</p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                <span className="font-medium">{article.source[lang]}</span>
                                <span>·</span>
                                <span>{article.timeAgo[lang]}</span>
                              </div>
                              <div className="ml-auto flex items-center gap-2.5 text-gray-300">
                                <button onClick={e => {
                        e.stopPropagation();
                        toggleBookmark(article.id);
                      }} className={`transition-colors ${bookmarkedArticles.has(article.id) ? 'text-gray-700' : 'hover:text-gray-500'}`}>
                                  <Bookmark size={13} className={bookmarkedArticles.has(article.id) ? 'fill-gray-700' : ''} />
                                </button>
                              </div>
                            </div>
                          </div>
                          <figure className="shrink-0 w-[88px] h-[72px] rounded-xl overflow-hidden bg-gray-100">
                            <img src={article.image} alt={article.title[lang]} className="w-full h-full object-cover" />
                          </figure>
                        </article>)}
                      {regularInChip.length > 4 && <button onClick={() => setFeedExpanded(v => !v)} className="bg-white w-full flex items-center justify-center gap-2 py-3.5 text-[13px] font-bold text-gray-500 hover:text-gray-700 border-t border-gray-50 transition-colors">
                          <span>{feedExpanded ? lang === 'ko' ? '접기' : lang === 'ja' ? '折りたたむ' : lang === 'vi' ? 'Thu gọn' : 'Show less' : lang === 'ko' ? `더보기 +${regularInChip.length - 4}` : lang === 'ja' ? `もっと見る +${regularInChip.length - 4}` : lang === 'vi' ? `Xem thêm +${regularInChip.length - 4}` : `Show more +${regularInChip.length - 4}`}</span>
                          <ChevronDown size={14} className={`transition-transform duration-200 ${feedExpanded ? 'rotate-180' : ''}`} />
                        </button>}
                    </div>}
                </div>}
            </motion.div>}

          {/* ════ ARTICLE DETAIL ════ */}
          {activeTab === 'home' && selectedArticle && <motion.div key={`article-${selectedArticle.id}`} initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} transition={{
          duration: 0.18
        }} className="pb-24">
              <DetailHeader onBack={() => setSelectedArticle(null)} backLabel={t(lang, 'back')} />
              <figure>
                <img src={selectedArticle.image} alt={selectedArticle.title[lang]} className="w-full h-52 object-cover" />
              </figure>
              <div className="bg-white px-4 pt-5 pb-5 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`${selectedArticle.categoryColor} text-white text-[10px] font-black px-2.5 py-1 rounded-full`}>{selectedArticle.category}</span>
                </div>
                <h1 className="text-[18px] font-black text-gray-900 leading-snug mb-2">{selectedArticle.title[lang]}</h1>
                <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-5">
                  <span className="font-semibold text-gray-500">{selectedArticle.source[lang]}</span>
                  <span>·</span>
                  <span>{selectedArticle.timeAgo[lang]}</span>
                </div>
                <div className="flex flex-col gap-4">
                  {selectedArticle.body[lang].map((paragraph, pIdx) => <p key={pIdx} className="text-[14px] text-gray-700 leading-[1.8]">{paragraph}</p>)}
                </div>
              </div>
              <div className="bg-white mt-[1px] px-4 py-4 flex items-center justify-between border-b border-gray-100">
                <div className="flex items-center gap-4 text-gray-400">
                  <button onClick={() => toggleLikeArticle(selectedArticle.id)} className={`flex items-center gap-1.5 transition-colors ${likedArticles.has(selectedArticle.id) ? 'text-red-500' : 'hover:text-red-400'}`}>
                    <Heart size={18} className={likedArticles.has(selectedArticle.id) ? 'fill-red-500' : ''} />
                    <span className="text-[13px] font-semibold">{selectedArticle.likes + (likedArticles.has(selectedArticle.id) ? 1 : 0)}</span>
                  </button>
                </div>
                <button onClick={() => toggleBookmark(selectedArticle.id)} className={`flex items-center gap-1.5 transition-colors ${bookmarkedArticles.has(selectedArticle.id) ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}>
                  <Bookmark size={18} className={bookmarkedArticles.has(selectedArticle.id) ? 'fill-gray-800' : ''} />
                  <span className="text-[12px] font-semibold">{bookmarkedArticles.has(selectedArticle.id) ? lang === 'ko' ? '저장됨' : lang === 'ja' ? '保存済み' : lang === 'vi' ? 'Đã lưu' : 'Saved' : lang === 'ko' ? '저장' : lang === 'ja' ? '保存' : lang === 'vi' ? 'Lưu' : 'Save'}</span>
                </button>
              </div>

              {/* Related Discussion */}
              <div className="bg-white mt-[1px] px-4 pt-5 pb-5">
                <h3 className="text-[14px] font-black text-gray-900 mb-4">
                  {lang === 'ko' ? '관련 토론' : lang === 'ja' ? '関連ディスカッション' : lang === 'vi' ? 'Thảo luận liên quan' : 'Related Discussion'}
                </h3>
                {(() => {
              const relatedThreads = COMMUNITY_THREADS.filter(th => th.articleId === selectedArticle.id);
              if (relatedThreads.length === 0) {
                return <div className="border border-gray-100 rounded-2xl px-6 py-8 flex flex-col items-center text-center bg-gray-50/50">
                        <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center mb-3">
                          <MessageCircle size={22} className="text-pink-300" />
                        </div>
                        <p className="text-[14px] font-bold text-gray-700 mb-1">
                          {lang === 'ko' ? '아직 관련 토론이 없어요' : lang === 'ja' ? 'まだ関連トピックはありません' : lang === 'vi' ? 'Chưa có thảo luận liên quan' : 'No related discussion yet'}
                        </p>
                        <p className="text-[12px] text-gray-400 mb-4">
                          {lang === 'ko' ? '이 기사로 토론을 직접 열어보세요!' : lang === 'ja' ? 'この記事でトピックを開いてみましょう！' : lang === 'vi' ? 'Hãy mở thảo luận từ bài viết này!' : 'Start a discussion from this article!'}
                        </p>
                        <button className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-[13px] font-bold" style={{
                    background: 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                  }}>
                          <MessageCircle size={14} />
                          <span>{lang === 'ko' ? '토론 열기 요청하기' : lang === 'ja' ? 'トピックを開くリクエスト' : lang === 'vi' ? 'Yêu cầu mở thảo luận' : 'Request Discussion'}</span>
                        </button>
                      </div>;
              }
              return <div className="flex flex-col gap-3">
                      {relatedThreads.map(thread => <button key={thread.id} onClick={() => {
                  setActiveTab('community');
                  setSelectedThread(thread);
                  setSelectedArticle(null);
                }} className="w-full text-left rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                          <div className={`bg-gradient-to-r ${thread.accentFrom} ${thread.accentTo} px-4 py-3`}>
                            <span className="text-white text-[10px] font-black px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">{thread.category}</span>
                          </div>
                          <div className="bg-white px-4 py-3">
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <MessageCircle size={11} className="text-pink-500" />
                              <span className="text-[11px] font-semibold text-pink-500">
                                {lang === 'ko' ? '이 주제로 토론 중이에요' : lang === 'ja' ? 'このトピックで議論中です' : lang === 'vi' ? 'Đang thảo luận về chủ đề này' : 'Discussion in progress'}
                              </span>
                            </div>
                            <p className="text-[15px] font-black text-gray-900 leading-snug mb-3">{thread.topicTitle[lang]}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1 text-[12px] text-gray-400">
                                <MessageCircle size={12} />
                                <span>{lang === 'ko' ? `${thread.commentCount}명 참여 중` : lang === 'ja' ? `${thread.commentCount}人が参加中` : lang === 'vi' ? `${thread.commentCount} người tham gia` : `${thread.commentCount} participating`}</span>
                              </div>
                              <span className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-white text-[12px] font-bold" style={{
                        background: 'linear-gradient(135deg, #ec4899, #8b5cf6)'
                      }}>
                                <span>{lang === 'ko' ? '토론 참여하기' : lang === 'ja' ? '議論に参加' : lang === 'vi' ? 'Tham gia' : 'Join'}</span>
                              </span>
                            </div>
                          </div>
                        </button>)}
                    </div>;
            })()}
              </div>

              {/* Related Articles */}
              {(() => {
            const relatedArticles = ARTICLES.filter(a => a.categoryKey === selectedArticle.categoryKey && a.id !== selectedArticle.id).slice(0, 3);
            if (relatedArticles.length === 0) return null;
            return <div className="bg-white mt-[1px] px-4 pt-5 pb-4">
                  <h3 className="text-[14px] font-black text-gray-900 mb-3">
                    {lang === 'ko' ? '관련 기사' : lang === 'ja' ? '関連記事' : lang === 'vi' ? 'Bài viết liên quan' : 'Related Articles'}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {relatedArticles.map(article => <button key={article.id} onClick={() => setSelectedArticle(article)} className="flex gap-3 text-left hover:bg-gray-50 rounded-xl transition-colors py-1">
                        <figure className="shrink-0 w-[80px] h-[64px] rounded-xl overflow-hidden bg-gray-100">
                          <img src={article.image} alt={article.title[lang]} className="w-full h-full object-cover" />
                        </figure>
                        <div className="flex-1 min-w-0">
                          <span className={`${article.categoryColor} text-white text-[9px] font-black px-2 py-0.5 rounded-full`}>{article.category}</span>
                          <p className="text-[13px] font-bold text-gray-800 leading-snug mt-1 line-clamp-2">{article.title[lang]}</p>
                          <p className="text-[11px] text-gray-400 mt-1">{article.source[lang]} · {article.timeAgo[lang]}</p>
                        </div>
                      </button>)}
                  </div>
                </div>;
          })()}

              {/* Article Comments */}
              {(ARTICLE_COMMENTS[selectedArticle.id] ?? []).length > 0 && <div className="bg-white mt-[1px] px-4 pt-5 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[14px] font-black text-gray-900">
                      {lang === 'ko' ? `댓글 ${(ARTICLE_COMMENTS[selectedArticle.id] ?? []).length}` : lang === 'ja' ? `コメント ${(ARTICLE_COMMENTS[selectedArticle.id] ?? []).length}` : lang === 'vi' ? `Bình luận ${(ARTICLE_COMMENTS[selectedArticle.id] ?? []).length}` : `Comments ${(ARTICLE_COMMENTS[selectedArticle.id] ?? []).length}`}
                    </h3>
                    <div className="flex items-center gap-0.5 bg-gray-100 rounded-full p-0.5">
                      <button onClick={() => setCommentSort('latest')} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${commentSort === 'latest' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                        <Clock size={9} />
                        <span>{lang === 'ko' ? '최신순' : lang === 'ja' ? '最新' : lang === 'vi' ? 'Mới nhất' : 'Latest'}</span>
                      </button>
                      <button onClick={() => setCommentSort('popular')} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${commentSort === 'popular' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                        <Flame size={9} />
                        <span>{lang === 'ko' ? '인기순' : lang === 'ja' ? '人気順' : lang === 'vi' ? 'Phổ biến' : 'Popular'}</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4">
                    {[...(ARTICLE_COMMENTS[selectedArticle.id] ?? [])].sort((a, b) => commentSort === 'popular' ? b.likes - a.likes : 0).map(comment => <div key={comment.id}>
                        <div className="flex gap-3">
                          <img src={comment.avatar} alt={comment.user} className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="text-[12px] font-bold text-gray-800">{comment.user}</span>
                              <span className="text-[11px]">{comment.country}</span>
                              <span className="text-[11px] text-gray-400 ml-auto">{comment.timeAgo}</span>
                            </div>
                            <p className="text-[13px] text-gray-700 leading-relaxed">{comment.text[lang]}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <button onClick={() => toggleLikeArticleComment(comment.id)} className={`flex items-center gap-1 transition-colors ${likedArticleComments.has(comment.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                                <Heart size={12} className={likedArticleComments.has(comment.id) ? 'fill-red-500' : ''} />
                                <span className="text-[11px] font-semibold">{comment.likes + (likedArticleComments.has(comment.id) ? 1 : 0)}</span>
                              </button>
                              <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-[11px] font-semibold text-gray-400 hover:text-pink-500 transition-colors">
                                {lang === 'ko' ? '답글' : lang === 'ja' ? '返信' : lang === 'vi' ? 'Trả lời' : 'Reply'}
                              </button>
                            </div>
                            {replyingTo === comment.id && <div className="mt-2 flex items-center gap-2">
                                <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-2 gap-1.5">
                                  <input type="text" value={commentInput} onChange={e => setCommentInput(e.target.value)} placeholder={`@${comment.user} ${lang === 'ko' ? '에게 답글...' : lang === 'ja' ? 'に返信...' : lang === 'vi' ? 'Trả lời...' : 'Reply...'}`} className="flex-1 bg-transparent text-[12px] text-gray-700 outline-none placeholder:text-gray-400" />
                                </div>
                                <button onClick={() => {
                        setCommentInput('');
                        setReplyingTo(null);
                      }} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${commentInput.trim() ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                                  <Send size={13} />
                                </button>
                              </div>}
                          </div>
                        </div>
                        {(comment.replies ?? []).length > 0 && <div className="ml-12 mt-3 flex flex-col gap-3 border-l-2 border-gray-100 pl-3">
                            {(comment.replies ?? []).map(reply => <div key={reply.id} className="flex gap-2.5">
                                <img src={reply.avatar} alt={reply.user} className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-100" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[11px] font-bold text-gray-800">{reply.user}</span>
                                    <span className="text-[10px]">{reply.country}</span>
                                    <span className="text-[10px] text-gray-400 ml-auto">{reply.timeAgo}</span>
                                  </div>
                                  <p className="text-[12px] text-gray-600 leading-relaxed">{reply.text[lang]}</p>
                                  <button onClick={() => toggleLikeArticleComment(reply.id)} className={`flex items-center gap-1 mt-1.5 transition-colors ${likedArticleComments.has(reply.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                                    <Heart size={11} className={likedArticleComments.has(reply.id) ? 'fill-red-500' : ''} />
                                    <span className="text-[10px] font-semibold">{reply.likes + (likedArticleComments.has(reply.id) ? 1 : 0)}</span>
                                  </button>
                                </div>
                              </div>)}
                          </div>}
                      </div>)}
                  </div>
                </div>}

              <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-100 z-50">
                <AnimatePresence>
                  {showEmojiPicker && <motion.div initial={{
                opacity: 0,
                y: 6
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: 6
              }} transition={{
                duration: 0.13
              }} className="px-4 pt-2 pb-1">
                      <div className="flex gap-1 mb-2">
                        {REACTION_CATEGORIES.map(cat => <button key={cat.id} onClick={() => setEmojiCategory(cat.id)} className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-colors ${emojiCategory === cat.id ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{cat.label}</button>)}
                      </div>
                      <div className="grid grid-cols-10 gap-0.5">
                        {(REACTION_CATEGORIES.find(c => c.id === emojiCategory)?.emojis ?? []).map(emoji => <button key={emoji} onClick={() => setCommentInput(prev => prev + emoji)} className="h-9 flex items-center justify-center rounded-lg text-[18px] hover:bg-pink-50 transition-colors active:scale-90">{emoji}</button>)}
                      </div>
                    </motion.div>}
                </AnimatePresence>
                <div className="flex items-center gap-2.5 px-4 py-2.5">
                  <button onClick={() => setShowEmojiPicker(v => !v)} className={`w-9 h-9 rounded-full flex items-center justify-center text-[18px] transition-all shrink-0 ${showEmojiPicker ? 'bg-pink-100' : 'bg-gray-100 hover:bg-gray-200'}`}>😊</button>
                  <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5 gap-2">
                    <input type="text" value={commentInput} onChange={e => setCommentInput(e.target.value)} placeholder={t(lang, 'addComment')} className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400" />
                  </div>
                  <button onClick={() => setCommentInput('')} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${commentInput.trim() ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-gray-100 text-gray-300'}`}>
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </motion.div>}

          {/* ════ COMMUNITY TAB ════ */}
          {activeTab === 'community' && !selectedThread && <motion.div key="community" initial={{
          opacity: 0,
          x: 10
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -10
        }} transition={{
          duration: 0.18
        }}>
              <div className="px-5 py-5 bg-gradient-to-br from-pink-500 via-rose-500 to-violet-600 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={16} className="opacity-90" />
                  <span className="text-[11px] font-bold tracking-widest opacity-90 uppercase">{t(lang, 'trendingNow')}</span>
                </div>
                <h2 className="text-[15px] font-black leading-snug flex items-center gap-1.5 flex-wrap">
                  <span>
                    {lang === 'ko' && '지금 K-컬처 팬들이 가장 많이 이야기하는 주제예요'}
                    {lang === 'en' && 'The hottest topics K-Culture fans are talking about'}
                    {lang === 'ja' && 'K-カルチャーファンが最も話している話題です'}
                    {lang === 'vi' && 'Chủ đề nóng nhất mà người hâm mộ K-Culture đang thảo luận'}
                  </span>
                  <span>🌊</span>
                </h2>
              </div>

              {/* Live comment ticker — directly below banner, above cards */}
              <div className="mx-4 mt-4 mb-1 bg-white rounded-2xl border border-gray-100 px-4 py-3 overflow-hidden">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shrink-0" />
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {lang === 'ko' ? '실시간 댓글' : lang === 'ja' ? 'リアルタイムコメント' : lang === 'vi' ? 'Bình luận trực tiếp' : 'Live Comments'}
                  </span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.button key={`tick-${liveTickIdx}`} initial={{
                opacity: 0,
                y: 12
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -12
              }} transition={{
                duration: 0.35,
                ease: 'easeOut'
              }} className="flex items-center gap-2.5 w-full text-left hover:bg-gray-50 rounded-xl px-1 py-0.5 transition-colors" onClick={() => {
                const tick = LIVE_COMMENT_TICKS[liveTickIdx];
                const matchThread = COMMUNITY_THREADS.find(th => th.id === tick.threadId);
                if (matchThread) {
                  setSelectedThread(matchThread);
                  if (tick.commentId) {
                    setHighlightedCommentId(tick.commentId);
                    setTimeout(() => setHighlightedCommentId(null), 3000);
                  }
                }
              }}>
                    <span className="text-[14px] shrink-0">{LIVE_COMMENT_TICKS[liveTickIdx].flag}</span>
                    <span className="text-[12px] font-bold text-pink-500 shrink-0">{LIVE_COMMENT_TICKS[liveTickIdx].user}</span>
                    <span className="text-[12px] text-gray-700 leading-snug truncate">{LIVE_COMMENT_TICKS[liveTickIdx].text[lang]}</span>
                    <ChevronRight size={11} className="text-gray-300 shrink-0" />
                  </motion.button>
                </AnimatePresence>
              </div>

              <div className="px-4 pt-3 pb-2 bg-[#f7f7f8]">
                <AnimatePresence mode="wait">
                  <motion.div key={`cards-page-${communityCardPage}`} initial={{
                opacity: 0,
                y: 8
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: -8
              }} transition={{
                duration: 0.2
              }} className="grid grid-cols-2 gap-3">
                    {COMMUNITY_QUICK_CARDS.slice(communityCardPage * 4, communityCardPage * 4 + 4).map(card => <button key={card.id} className="relative rounded-2xl overflow-hidden h-[110px] text-left flex flex-col justify-end shadow-sm active:scale-[0.97] transition-transform">
                        <img src={card.image} alt={card.title[lang]} className="absolute inset-0 w-full h-full object-cover" />
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.gradientFrom} ${card.gradientTo} opacity-75`} />
                        <div className="relative z-10 px-3.5 pb-3.5 pt-2">
                          <span className="text-xl leading-none">{card.emoji}</span>
                          <p className="text-white/80 text-[10px] font-bold uppercase tracking-wider leading-none mt-1.5 mb-0.5">{card.title[lang]}</p>
                          <p className="text-white text-[13px] font-black leading-snug">{card.subtitle[lang]}</p>
                        </div>
                      </button>)}
                  </motion.div>
                </AnimatePresence>
                <button onClick={() => {
              setCommunityCardPage(prev => prev === 0 ? 1 : 0);
              setIsRefreshSpinning(true);
              setTimeout(() => setIsRefreshSpinning(false), 500);
            }} className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-white border border-gray-200 hover:bg-pink-50 hover:border-pink-200 transition-all active:scale-[0.98] group">
                  <motion.span animate={{
                rotate: isRefreshSpinning ? 360 : 0
              }} transition={{
                duration: 0.5,
                ease: 'easeInOut'
              }} className="text-pink-400 group-hover:text-pink-500">
                    <RefreshCw size={13} />
                  </motion.span>
                  <span className="text-[12px] font-bold text-gray-500 group-hover:text-pink-500 transition-colors">
                    {lang === 'ko' ? '또 다른 주제 보기' : lang === 'ja' ? '他のトピックを見る' : lang === 'vi' ? 'Xem chủ đề khác' : 'Explore More Topics'}
                  </span>
                  <span className="text-[10px] font-bold text-gray-300 group-hover:text-pink-300 transition-colors">
                    {communityCardPage === 0 ? '1/2' : '2/2'}
                  </span>
                </button>
              </div>

              <div className="px-4 pt-4 pb-1">
                <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
                  {lang === 'ko' ? '👀 이 주제, 어떻게 생각하세요?' : lang === 'ja' ? '👀 このトピック、どう思いますか？' : lang === 'vi' ? '👀 Bạn nghĩ gì về chủ đề này?' : '👀 What do you think about this topic?'}
                </p>
              </div>
              <div className="flex flex-col gap-[1px] bg-gray-100 mt-2">
                {shuffledThreads.map((thread, tIdx) => <motion.button key={thread.id} initial={{
              opacity: 0,
              y: 16
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.22,
              delay: tIdx * 0.06
            }} onClick={() => setSelectedThread(thread)} className="bg-white text-left w-full">
                    <div className="flex gap-3 px-4 pt-4 pb-3">
                      <div className="shrink-0 w-[80px] h-[64px] rounded-xl overflow-hidden bg-gray-100">
                        <img src={thread.image} alt={thread.topicTitle[lang]} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className={`${thread.categoryColor} text-white text-[10px] font-black px-2 py-0.5 rounded-full`}>{thread.category}</span>
                          {thread.hotScore >= 90 && <span className="flex items-center gap-0.5 bg-red-50 text-red-500 text-[10px] font-black px-2 py-0.5 rounded-full">
                              <Flame size={8} />
                              <span>HOT</span>
                            </span>}
                        </div>
                        <h3 className="text-[14px] font-black text-gray-900 leading-snug line-clamp-2 mb-2">{thread.topicTitle[lang]}</h3>
                        <p className="text-[12px] font-semibold text-gray-500 leading-relaxed line-clamp-2 bg-gray-50 rounded-xl px-3 py-2">{thread.topicSummary[lang]}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 pb-3 border-t border-gray-50 pt-2.5">
                      <div className="flex items-center gap-3 text-[11px] text-gray-400">
                        <span className="flex items-center gap-0.5"><MessageCircle size={10} /><span>{lang === 'ko' ? `${thread.commentCount}명 참여중` : lang === 'ja' ? `${thread.commentCount}人参加中` : lang === 'vi' ? `${thread.commentCount} đang tham gia` : `${thread.commentCount} participating`}</span></span>
                        <span className="flex items-center gap-0.5"><Heart size={10} /><span>{thread.likeCount.toLocaleString()}</span></span>
                      </div>
                      <span className="flex items-center gap-1 text-[11px] text-pink-500 font-semibold shrink-0">
                        <span>{t(lang, 'joinDiscussion')}</span>
                        <ChevronRight size={12} />
                      </span>
                    </div>
                  </motion.button>)}
              </div>
            </motion.div>}

          {/* ════ THREAD DETAIL ════ */}
          {activeTab === 'community' && selectedThread && <motion.div key={`thread-${selectedThread.id}`} initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} transition={{
          duration: 0.18
        }} className="pb-24">
              <DetailHeader onBack={() => setSelectedThread(null)} backLabel={t(lang, 'back')} />
              <div className="relative overflow-hidden">
                <img src={selectedThread.image} alt={selectedThread.topicTitle[lang]} className="w-full h-44 object-cover" />
                <div className={`absolute inset-0 bg-gradient-to-t ${selectedThread.accentFrom} ${selectedThread.accentTo} opacity-70`} />
                <div className="absolute inset-0 px-5 py-6 flex flex-col justify-end">
                  <span className="text-white text-[10px] font-black px-2.5 py-1 rounded-full bg-white/20 self-start mb-3">{selectedThread.category}</span>
                  <h2 className="text-[20px] font-black text-white leading-snug">{selectedThread.topicTitle[lang]}</h2>
                </div>
              </div>
              <div className="bg-white px-4 pt-4 pb-4 border-b border-gray-100">
                <div className="rounded-2xl px-4 py-3.5 mb-3" style={{
              background: 'linear-gradient(135deg, #fdf2f8, #f3e8ff)'
            }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <MessageCircle size={11} className="text-pink-500" />
                    <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest">
                      {lang === 'ko' ? '토론 주제' : lang === 'ja' ? 'トピック' : lang === 'vi' ? 'Chủ đề' : 'Discussion Topic'}
                    </span>
                  </div>
                  <p className="text-[14px] font-bold text-gray-800 leading-relaxed">{selectedThread.topicSummary[lang]}</p>
                </div>
                <div className="flex items-center gap-3 text-[12px] text-gray-400">
                  <span className="flex items-center gap-1"><Heart size={13} /><span>{selectedThread.likeCount.toLocaleString()} {t(lang, 'likeBadge')}</span></span>
                </div>
              </div>
              <div className="bg-white mt-[1px] px-4 pt-4 pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-black text-gray-900">
                    {lang === 'ko' ? `댓글 ${selectedThread.comments.length}` : lang === 'ja' ? `コメント ${selectedThread.comments.length}` : lang === 'vi' ? `Bình luận ${selectedThread.comments.length}` : `Comments ${selectedThread.comments.length}`}
                  </h3>
                  <div className="flex items-center gap-0.5 bg-gray-100 rounded-full p-0.5">
                    <button onClick={() => setCommentSort('latest')} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${commentSort === 'latest' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                      <Clock size={9} />
                      <span>{lang === 'ko' ? '최신순' : lang === 'ja' ? '最新' : lang === 'vi' ? 'Mới nhất' : 'Latest'}</span>
                    </button>
                    <button onClick={() => setCommentSort('popular')} className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${commentSort === 'popular' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
                      <Flame size={9} />
                      <span>{lang === 'ko' ? '인기순' : lang === 'ja' ? '人気順' : lang === 'vi' ? 'Phổ biến' : 'Popular'}</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {[...selectedThread.comments].sort((a, b) => commentSort === 'popular' ? b.likes - a.likes : 0).map(comment => <div key={comment.id} ref={highlightedCommentId === comment.id ? highlightRef : null} className={`rounded-xl transition-colors duration-500 ${highlightedCommentId === comment.id ? 'bg-pink-50 ring-1 ring-pink-200 px-2 py-1 -mx-2' : ''}`}>
                      <div className="flex gap-3">
                        <img src={comment.avatar} alt={comment.user} className="w-9 h-9 rounded-full object-cover shrink-0 border border-gray-100" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[12px] font-bold text-gray-800">{comment.user}</span>
                            <span className="text-[11px]">{comment.country}</span>
                            <span className="text-[11px] text-gray-400 ml-auto">{comment.timeAgo}</span>
                          </div>
                          <p className="text-[13px] text-gray-700 leading-relaxed">{comment.text[lang]}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <button onClick={() => toggleLikeComment(comment.id)} className={`flex items-center gap-1 transition-colors ${likedComments.has(comment.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                              <Heart size={12} className={likedComments.has(comment.id) ? 'fill-red-500' : ''} />
                              <span className="text-[11px] font-semibold">{comment.likes + (likedComments.has(comment.id) ? 1 : 0)}</span>
                            </button>
                            <button onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)} className="text-[11px] font-semibold text-gray-400 hover:text-pink-500 transition-colors">
                              {lang === 'ko' ? '대댓글' : lang === 'ja' ? '返信' : lang === 'vi' ? 'Trả lời' : 'Reply'}
                            </button>
                          </div>
                          {replyingTo === comment.id && <div className="mt-2 flex items-center gap-2">
                              <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-2 gap-1.5">
                                <input type="text" value={commentInput} onChange={e => setCommentInput(e.target.value)} placeholder={`@${comment.user} ${lang === 'ko' ? '에게 대댓글...' : lang === 'ja' ? 'に返信...' : lang === 'vi' ? 'Trả lời...' : 'Reply...'}`} className="flex-1 bg-transparent text-[12px] text-gray-700 outline-none placeholder:text-gray-400" />
                              </div>
                              <button onClick={() => {
                                setCommentInput('');
                                setReplyingTo(null);
                              }} className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${commentInput.trim() ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-300'}`}>
                                <Send size={13} />
                              </button>
                            </div>}
                        </div>
                      </div>
                      {(comment.replies ?? []).length > 0 && <div className="ml-12 mt-3 flex flex-col gap-3 border-l-2 border-gray-100 pl-3">
                          {(comment.replies ?? []).map(reply => <div key={reply.id} className="flex gap-2.5">
                              <img src={reply.avatar} alt={reply.user} className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-100" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="text-[11px] font-bold text-gray-800">{reply.user}</span>
                                  <span className="text-[10px]">{reply.country}</span>
                                  <span className="text-[10px] text-gray-400 ml-auto">{reply.timeAgo}</span>
                                </div>
                                <p className="text-[12px] text-gray-600 leading-relaxed">{reply.text[lang]}</p>
                                <button onClick={() => toggleLikeComment(reply.id)} className={`flex items-center gap-1 mt-1.5 transition-colors ${likedComments.has(reply.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
                                  <Heart size={11} className={likedComments.has(reply.id) ? 'fill-red-500' : ''} />
                                  <span className="text-[10px] font-semibold">{reply.likes + (likedComments.has(reply.id) ? 1 : 0)}</span>
                                </button>
                              </div>
                            </div>)}
                        </div>}
                    </div>)}
                </div>
              </div>

              {/* Community Thread Comment Input Bar */}
              <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-100 z-50">
                <AnimatePresence>
                  {showCommunityEmojiPicker && <motion.div initial={{
                opacity: 0,
                y: 6
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                y: 6
              }} transition={{
                duration: 0.13
              }} className="px-4 pt-2 pb-1">
                      <div className="flex gap-1 mb-2">
                        {REACTION_CATEGORIES.map(cat => <button key={cat.id} onClick={() => setCommunityEmojiCategory(cat.id)} className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-colors ${communityEmojiCategory === cat.id ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>{cat.label}</button>)}
                      </div>
                      <div className="grid grid-cols-10 gap-0.5">
                        {(REACTION_CATEGORIES.find(c => c.id === communityEmojiCategory)?.emojis ?? []).map(emoji => <button key={emoji} onClick={() => setCommentInput(prev => prev + emoji)} className="h-9 flex items-center justify-center rounded-lg text-[18px] hover:bg-pink-50 transition-colors active:scale-90">{emoji}</button>)}
                      </div>
                    </motion.div>}
                </AnimatePresence>
                <div className="flex items-center gap-2.5 px-4 py-2.5">
                  <button onClick={() => setShowCommunityEmojiPicker(v => !v)} className={`w-9 h-9 rounded-full flex items-center justify-center text-[18px] transition-all shrink-0 ${showCommunityEmojiPicker ? 'bg-pink-100' : 'bg-gray-100 hover:bg-gray-200'}`}>😊</button>
                  <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2.5 gap-2">
                    <input type="text" value={commentInput} onChange={e => setCommentInput(e.target.value)} onKeyDown={e => {
                  if (e.key === 'Enter' && commentInput.trim()) {
                    setCommentInput('');
                    setShowCommunityEmojiPicker(false);
                  }
                }} placeholder={t(lang, 'addComment')} className="flex-1 bg-transparent text-[13px] text-gray-700 outline-none placeholder:text-gray-400" />
                  </div>
                  <button onClick={() => {
                if (commentInput.trim()) {
                  setCommentInput('');
                  setShowCommunityEmojiPicker(false);
                }
              }} className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${commentInput.trim() ? 'bg-pink-500 text-white shadow-lg shadow-pink-200' : 'bg-gray-100 text-gray-300'}`}>
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </motion.div>}

          {/* ════ PROFILE TAB ════ */}
          {activeTab === 'profile' && <motion.div key="profile" initial={{
          opacity: 0,
          x: 10
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -10
        }} transition={{
          duration: 0.18
        }}>
              <div className="bg-gradient-to-br from-pink-500 via-rose-500 to-violet-600 px-5 pt-6 pb-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full border-3 border-white/40 overflow-hidden shadow-lg">
                      {profileData.avatar && profileData.avatar.startsWith('emoji:') ? <div className="w-full h-full bg-gradient-to-br from-pink-300 to-violet-400 flex items-center justify-center">
                          <span className="text-3xl leading-none">{profileData.avatar.replace('emoji:', '')}</span>
                        </div> : <img src={profileData.avatar || 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=200&h=200&fit=crop'} alt="Profile" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h2 className="text-[18px] font-black text-white leading-tight">{profileData.name}</h2>
                      <p className="text-[12px] text-white/70 font-medium">@{profileData.handle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setOverlay('editProfile')} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-[11px] font-bold border border-white/30 hover:bg-white/30 transition-colors">
                      <Edit3 size={11} />
                      <span>{t(lang, 'editProfile')}</span>
                    </button>
                    <button onClick={() => setOverlay('settings')} className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
                      <Settings size={14} className="text-white" />
                    </button>
                  </div>
                </div>
                <p className="text-[12px] text-white/80 leading-relaxed mb-4">{profileData.bio}</p>
              </div>
              <div className="-mt-5 mx-4 bg-white rounded-2xl shadow-lg overflow-hidden mb-3">
                <div className="flex">
                  <button onClick={() => setProfileSubTab('bookmarks')} className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold transition-colors ${profileSubTab === 'bookmarks' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-gray-600'}`}>
                    <Bookmark size={14} />
                    <span>{t(lang, 'bookmarks')}</span>
                  </button>
                  <button onClick={() => setProfileSubTab('activity')} className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-[12px] font-bold transition-colors ${profileSubTab === 'activity' ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-400 hover:text-gray-600'}`}>
                    <MessageCircle size={14} />
                    <span>{t(lang, 'activity')}</span>
                  </button>
                </div>
              </div>
              {profileSubTab === 'bookmarks' && <div className="px-4 pb-6">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">{t(lang, 'myBookmarks')}</p>
                  {bookmarkedList.length === 0 ? <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                      <Bookmark size={36} className="mb-3" />
                      <p className="text-[13px] font-semibold text-gray-400">{t(lang, 'noBookmarks')}</p>
                      <p className="text-[11px] text-gray-300 mt-1">{t(lang, 'bookmarkHint')}</p>
                    </div> : <div className="flex flex-col gap-3">
                      {bookmarkedList.map(article => <div key={article.id} onClick={() => {
                setActiveTab('home');
                setSelectedArticle(article);
              }} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-50 cursor-pointer hover:shadow-md transition-shadow flex gap-3 p-3">
                          <figure className="shrink-0 w-[72px] h-[60px] rounded-xl overflow-hidden bg-gray-100">
                            <img src={article.image} alt={article.title[lang]} className="w-full h-full object-cover" />
                          </figure>
                          <div className="flex-1 min-w-0">
                            <span className={`${article.categoryColor} text-white text-[9px] font-black px-2 py-0.5 rounded-full`}>{article.category}</span>
                            <p className="text-[13px] font-bold text-gray-800 leading-snug mt-1 line-clamp-2">{article.title[lang]}</p>
                            <p className="text-[11px] text-gray-400 mt-0.5">{article.source[lang]} · {article.timeAgo[lang]}</p>
                          </div>
                        </div>)}
                    </div>}
                </div>}
              {profileSubTab === 'activity' && <div className="px-4 pb-6">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">{t(lang, 'myActivity')}</p>
                  {MY_ACTIVITY.length === 0 ? <div className="flex flex-col items-center justify-center py-16 text-gray-300">
                      <MessageCircle size={36} className="mb-3" />
                      <p className="text-[13px] font-semibold text-gray-400">{t(lang, 'noActivity')}</p>
                    </div> : <div className="flex flex-col gap-3">
                      {MY_ACTIVITY.map(item => <div key={item.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50">
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className={`${item.articleCategoryColor} text-white text-[9px] font-black px-2 py-0.5 rounded-full`}>{item.articleCategory}</span>
                            <span className="text-[11px] text-gray-400">{item.timeAgo}</span>
                            <span className="ml-auto">
                              {item.type === 'comment' ? <MessageCircle size={13} className="text-blue-400" /> : <Heart size={13} className="text-red-400 fill-red-400" />}
                            </span>
                          </div>
                          <p className="text-[12px] font-semibold text-gray-600 line-clamp-1 mb-1">{item.articleTitle[lang]}</p>
                          {item.type === 'comment' && item.commentText[lang] && <div className="bg-gray-50 rounded-xl px-3 py-2 mt-2">
                              <p className="text-[12px] text-gray-700 leading-relaxed">"{item.commentText[lang]}"</p>
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400">
                                <Heart size={9} />
                                <span>{item.likeCount}</span>
                              </div>
                            </div>}
                        </div>)}
                    </div>}
                </div>}
            </motion.div>}

        </AnimatePresence>
      </main>

      {/* ── Bottom Navigation ── */}
      {showBottomNav && <nav className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto bg-white border-t border-gray-100 z-40 flex">
          {BOTTOM_NAV_ITEMS.map(item => <button key={item.id} onClick={() => {
        setActiveTab(item.id);
        setSelectedThread(null);
        setSelectedArticle(null);
      }} className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors relative ${activeTab === item.id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>
              {activeTab === item.id ? item.activeIcon : item.icon}
              <span className="text-[10px] font-bold tracking-wide">{t(lang, item.labelKey)}</span>
              {activeTab === item.id && <motion.span layoutId="bottom-nav-dot" className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-pink-500 rounded-full" />}
            </button>)}
        </nav>}

      <style dangerouslySetInnerHTML={{
      __html: `::-webkit-scrollbar { display: none; } * { -ms-overflow-style: none; scrollbar-width: none; }`
    }} />
    </div>;
};
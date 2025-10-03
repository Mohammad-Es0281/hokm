export const strings = {
    // General
    appName: 'حکم',
    loading: 'در حال بارگذاری...',
    error: 'خطا',
    ok: 'تأیید',
    cancel: 'لغو',
    back: 'بازگشت',

    // Lobby
    lobby: 'لابی',
    availableRooms: 'اتاق‌های موجود',
    createRoom: 'ایجاد اتاق',
    joinRoom: 'ورود به اتاق',
    noRoomsAvailable: 'اتاقی در دسترس نیست',
    refresh: 'به‌روزرسانی',

    // Room creation
    selectGameMode: 'حالت بازی را انتخاب کنید',
    twoPlayer: '۲ نفره',
    threePlayer: '۳ نفره',
    fourPlayer: '۴ نفره (تیمی)',
    turnTimer: 'زمان نوبت',
    seconds: 'ثانیه',
    kotBonus: 'پاداش کُت',
    targetHands: 'تعداد دست‌ها',
    bestOf: 'بهترین از',
    privateRoom: 'اتاق خصوصی',
    inviteCode: 'کد دعوت',

    // Game room
    waitingForPlayers: 'در انتظار بازیکنان...',
    playersNeeded: 'بازیکن مورد نیاز',
    gameStarting: 'بازی در حال شروع...',
    selectTrump: 'حکم را انتخاب کنید',
    yourTurn: 'نوبت شما',
    timeRemaining: 'زمان باقی‌مانده',

    // Suits (Persian names)
    hearts: 'دل',
    diamonds: 'خشت',
    clubs: 'گشنیز',
    spades: 'پیک',

    // Ranks (Persian names)
    A: 'اس',
    K: 'شاه',
    Q: 'بیگم',
    J: 'سرباز',
    '10': '۱۰',
    '9': '۹',
    '8': '۸',
    '7': '۷',
    '6': '۶',
    '5': '۵',
    '4': '۴',
    '3': '۳',
    '2': '۲',

    // Game messages
    trumpSelected: 'حکم انتخاب شد',
    cardPlayed: 'کارت بازی شد',
    trickWon: 'تک را برد',
    handComplete: 'دست تمام شد',
    matchComplete: 'بازی تمام شد',
    youWon: 'شما برنده شدید!',
    youLost: 'شما باختید',
    kot: 'کُت!',

    // Errors and validations
    timeout: 'زمان شما تمام شد — یک کارت به‌صورت خودکار بازی شد',
    invalidMove: 'حرکت نامعتبر',
    mustFollowSuit: 'باید از خال حکم پیروی کنید',
    notYourTurn: 'نوبت شما نیست',
    cardNotInHand: 'کارت در دست شما نیست',
    connectionLost: 'اتصال قطع شد',
    reconnecting: 'در حال اتصال مجدد...',

    // Scores
    score: 'امتیاز',
    tricks: 'تک‌ها',
    hands: 'دست‌ها',
    team: 'تیم',

    // Actions
    playCard: 'بازی کارت',
    leave: 'خروج',
    replay: 'بازپخش',
    newGame: 'بازی جدید',

    // Stats
    gamesPlayed: 'بازی‌های انجام شده',
    gamesWon: 'بازی‌های برده',
    handsWon: 'دست‌های برده',
    tricksWon: 'تک‌های برده',
    kotAchieved: 'کُت‌های گرفته شده',
    winRate: 'درصد برد',
};

export const getSuitName = (suit: string): string => {
    return strings[suit as keyof typeof strings] || suit;
};

export const getRankName = (rank: string): string => {
    return strings[rank as keyof typeof strings] || rank;
};
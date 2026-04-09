import React, { createContext, useContext, useState, useEffect } from 'react';
import { translateText } from '@/services/translationService';

type Language = 'ru' | 'uz';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  translate: (text: string) => Promise<string>;
}

const translations: Record<Language, Record<string, string>> = {
  ru: {
    'common.go': 'Перейти',
    'nav.catalog': 'Каталог',
    'nav.top': 'Топ Рейтинг',
    'nav.history': 'История',
    'nav.submit': 'Предложить',
    'nav.admin': 'Админ',
    'nav.settings': 'Настройки',
    'nav.navigation': 'Навигация',
    'nav.categories': 'Категории',
    'nav.home': 'Главная',
    'nav.favorites': 'Избранное',
    'home.hero.title': 'Лучшие ресурсы для вашего роста',
    'home.hero.subtitle': 'Курируемый каталог сайтов, приложений и курсов с высоким рейтингом.',
    'home.search.placeholder': 'Поиск ресурсов, инструментов, курсов...',
    'home.recommended': 'Рекомендовано для вас',
    'home.catalog': 'Каталог ресурсов',
    'home.no_results': 'Результатов не найдено',
    'home.no_results.subtitle': 'Попробуйте изменить фильтры или поисковый запрос.',
    'home.category.all': 'Все категории',
    'home.sort': 'Сортировка',
    'home.filters': 'Фильтры',
    'home.sort.highest_rating': 'Высший рейтинг',
    'home.sort.newest': 'Новинки',
    'home.sort.most_reviewed': 'Больше отзывов',
    'settings.title': 'Настройки',
    'settings.theme': 'Тема оформления',
    'settings.theme.system': 'Системная',
    'settings.theme.light': 'Светлая',
    'settings.theme.dark': 'Темная',
    'settings.language': 'Язык интерфейса',
    'settings.language.ru': 'Русский',
    'settings.language.uz': 'O\'zbekcha (Lotin)',
    'review.select_rating': 'Пожалуйста, выберите оценку',
    'review.success': 'Отзыв опубликован!',
    'review.error': 'Ошибка при публикации отзыва',
    'loading': 'Загрузка...',
    'item.visit': 'Посетить сайт',
    'item.favorite.add': 'В избранное',
    'item.favorite.remove': 'В избранном',
    'item.pros': 'Плюсы',
    'item.cons': 'Минусы',
    'item.reviews': 'Отзывы',
    'item.reviews.show': 'Показать отзывы',
    'item.reviews.hide': 'Скрыть отзывы',
    'item.reviews.write': 'Написать отзыв',
    'item.reviews.none': 'Отзывов пока нет. Будьте первым!',
    'item.details': 'Детали',
    'item.purpose': 'Назначение',
    'item.pricing': 'Цена',
    'item.pricing.free': 'Бесплатно',
    'item.pricing.paid': 'Платно',
    'item.platforms': 'Платформы',
    'item.audience': 'Для кого это?',
    'item.audience.level': 'Уровень',
    'item.audience.role': 'Роль',
    'item.audience.pc': 'Железо',
    'item.alternatives': 'Альтернативы',
    'item.related': 'Похожие ресурсы',
    'item.load_more': 'Загрузить еще',
    'item.new': 'Новое',
    'item.top': 'Топ',
    'item.share.copied': 'Ссылка скопирована!',
    'item.share.copy': 'Копировать',
    'item.audience.level.beginner': 'Новичок',
    'item.audience.level.pro': 'Профи',
    'item.audience.level.all': 'Всем',
    'item.audience.role.student': 'Школьник',
    'item.audience.role.developer': 'Разработчик',
    'item.audience.role.all': 'Всем',
    'item.audience.pc.weak': 'Слабый ПК',
    'item.audience.pc.powerful': 'Мощный ПК',
    'item.audience.pc.all': 'Любой ПК',
    'top.title': 'Зал Славы',
    'top.subtitle': 'Самые высокооцененные ресурсы в нашем каталоге по мнению сообщества.',
    'top.gold': '#1 Золото',
    'top.silver': '#2 Серебро',
    'top.bronze': '#3 Бронза',
    'top.category_top': 'Топ по категориям',
    'top.no_items': 'В этой категории пока нет ресурсов.',
    'history.title': 'История просмотров',
    'history.subtitle': 'Ресурсы, которые вы недавно посещали.',
    'history.clear': 'Очистить историю',
    'history.empty': 'История пуста',
    'history.empty_subtitle': 'Вы еще не просматривали ни одного ресурса. Начните изучение каталога, чтобы увидеть историю здесь.',
    'history.go_catalog': 'Перейти в каталог',
    'submit.title': 'Предложить Ресурс',
    'submit.subtitle': 'Знаете отличный сайт, приложение или курс? Поделитесь им с сообществом.',
    'submit.success_title': 'Заявка получена!',
    'submit.success_subtitle': 'Спасибо за предложение ресурса. Наша команда рассмотрит его и добавит в каталог, если он соответствует нашим критериям.',
    'submit.back': 'Назад в каталог',
    'submit.form.name': 'Название ресурса',
    'submit.form.category': 'Категория',
    'submit.form.category_placeholder': 'Выберите категорию',
    'submit.form.type': 'Тип ресурса',
    'submit.form.image': 'URL изображения/логотипа',
    'submit.form.short_desc': 'Краткое описание',
    'submit.form.full_desc': 'Полное описание',
    'submit.form.purpose': 'Основное назначение',
    'submit.form.pricing': 'Модель оплаты',
    'submit.form.link': 'Ссылка на официальный сайт',
    'submit.form.subscription': 'Стоимость подписки (если есть)',
    'submit.form.platforms': 'Доступные платформы',
    'submit.form.alternatives': 'Альтернативы (через запятую)',
    'submit.form.audience': 'Для кого этот ресурс?',
    'submit.form.pros': 'Плюсы (через запятую)',
    'submit.form.cons': 'Минусы (через запятую)',
    'submit.form.submit': 'Отправить заявку',
    'submit.form.submitting': 'Отправка...',
    'submit.form.disclaimer': 'Отправляя заявку, вы соглашаетесь с тем, что эта информация будет рассмотрена нашей командой.',
    'item.views': 'Просмотров',
    'item.clicks': 'Переходов',
    'item.reviews_count': 'Отзывов',
    'item.about': 'О ресурсе',
    'item.new_review': 'Новый отзыв',
    'item.your_name': 'Ваше имя (опционально)',
    'item.your_rating': 'Ваша оценка',
    'item.your_comment': 'Ваш комментарий',
    'item.cancel': 'Отмена',
    'item.publish': 'Опубликовать',
    'item.just_now': 'Только что',
    'footer.subtitle': 'Профессиональная платформа каталогов.',
    'admin.login.title': 'Вход для админа',
    'admin.login.password_label': 'Введите пароль администратора',
    'admin.login.error': 'Неверный пароль. Попробуйте еще раз.',
    'admin.login.submit': 'Разблокировать панель',
    'feedback.title': 'Вы посетили {name}',
    'feedback.question': 'Вам понравилось?',
    'feedback.rate': 'Оцените',
    'feedback.comment': 'Ваш отзыв',
    'feedback.submit': 'Отправить',
    'feedback.close': 'Закрыть',
    'admin.title': 'Вход для админа',
    'admin.password': 'Введите пароль администратора',
    'admin.unlock': 'Разблокировать панель',
    'admin.error': 'Неверный пароль. Попробуйте еще раз.',
  },
  uz: {
    'common.go': 'O\'tish',
    'nav.catalog': 'Katalog',
    'nav.top': 'Top Reyting',
    'nav.history': 'Tarix',
    'nav.submit': 'Taklif qilish',
    'nav.admin': 'Admin',
    'nav.settings': 'Sozlamalar',
    'nav.navigation': 'Navigatsiya',
    'nav.categories': 'Kategoriyalar',
    'nav.home': 'Bosh sahifa',
    'nav.favorites': 'Saralanganlar',
    'home.hero.title': 'O\'sishingiz uchun eng yaxshi resurslar',
    'home.hero.subtitle': 'Yuqori reytingga ega saytlar, ilovalar va kurslarning saralangan katalogi.',
    'home.search.placeholder': 'Resurslar, asboblar, kurslarni qidirish...',
    'home.recommended': 'Siz uchun tavsiya etiladi',
    'home.catalog': 'Resurslar katalogi',
    'home.no_results': 'Natijalar topilmadi',
    'home.no_results.subtitle': 'Filtrlarni yoki qidiruv so\'rovini o\'zgartirib ko\'ring.',
    'home.category.all': 'Barcha kategoriyalar',
    'home.sort': 'Saralash',
    'home.filters': 'Filtrlar',
    'home.sort.highest_rating': 'Eng yuqori reyting',
    'home.sort.newest': 'Yangilari',
    'home.sort.most_reviewed': 'Ko\'p sharhlanganlar',
    'settings.title': 'Sozlamalar',
    'settings.theme': 'Mavzu',
    'settings.theme.system': 'Tizim',
    'settings.theme.light': 'Yorug\'',
    'settings.theme.dark': 'Qorong\'u',
    'settings.language': 'Interfeys tili',
    'settings.language.ru': 'Ruscha',
    'settings.language.uz': 'O\'zbekcha (Lotin)',
    'review.select_rating': 'Iltimos, bahoni tanlang',
    'review.success': 'Sharh chop etildi!',
    'review.error': 'Sharhni chop etishda xatolik yuz berdi',
    'loading': 'Yuklanmoqda...',
    'item.visit': 'Saytga tashrif buyurish',
    'item.favorite.add': 'Saralanganlarga qo\'shish',
    'item.favorite.remove': 'Saralanganlarda',
    'item.pros': 'Afzalliklari',
    'item.cons': 'Kamchiliklari',
    'item.reviews': 'Sharhlar',
    'item.reviews.show': 'Sharhlarni ko\'rsatish',
    'item.reviews.hide': 'Sharhlarni yashirish',
    'item.reviews.write': 'Sharh yozish',
    'item.reviews.none': 'Hozircha sharhlar yo\'q. Birinchi bo\'ling!',
    'item.details': 'Tafsilotlar',
    'item.purpose': 'Maqsadi',
    'item.pricing': 'Narxi',
    'item.pricing.free': 'Bepul',
    'item.pricing.paid': 'Pullik',
    'item.platforms': 'Platformalar',
    'item.audience': 'Bu kim uchun?',
    'item.audience.level': 'Daraja',
    'item.audience.role': 'Rol',
    'item.audience.pc': 'Uskuna',
    'item.alternatives': 'Muqobillar',
    'item.related': 'O\'xshash resurslar',
    'item.load_more': 'Yana yuklash',
    'item.new': 'Yangi',
    'item.top': 'Top',
    'item.share.copied': 'Havola nusxalandi!',
    'item.share.copy': 'Nusxalash',
    'item.audience.level.beginner': 'Boshlovchi',
    'item.audience.level.pro': 'Profi',
    'item.audience.level.all': 'Barchaga',
    'item.audience.role.student': 'O\'quvchi',
    'item.audience.role.developer': 'Dasturchi',
    'item.audience.role.all': 'Barchaga',
    'item.audience.pc.weak': 'Kuchli bo\'lmagan PK',
    'item.audience.pc.powerful': 'Kuchli PK',
    'item.audience.pc.all': 'Har qanday PK',
    'top.title': 'Top Reyting',
    'top.subtitle': 'Hamjamiyat fikriga ko\'ra katalogimizdagi eng yuqori baholangan resurslar.',
    'top.gold': '#1 Oltin',
    'top.silver': '#2 Kumush',
    'top.bronze': '#3 Bronza',
    'top.category_top': 'Kategoriyalar bo\'yicha top',
    'top.no_items': 'Ushbu kategoriyada hali resurslar yo\'q.',
    'history.title': 'Ko\'rishlar tarixi',
    'history.subtitle': 'Siz yaqinda tashrif buyurgan resurslar.',
    'history.clear': 'Tarixni tozalash',
    'history.empty': 'Tarix bo\'sh',
    'history.empty_subtitle': 'Siz hali birorta ham resursni ko\'rmadingiz. Tarixni bu yerda ko\'rish uchun katalogni o\'rganishni boshlang.',
    'history.go_catalog': 'Katalogga o\'tish',
    'submit.title': 'Resurs taklif qilish',
    'submit.subtitle': 'Ajoyib sayt, ilova yoki kursni bilasizmi? Uni hamjamiyat bilan baham ko\'ring.',
    'submit.success_title': 'Ariza qabul qilindi!',
    'submit.success_subtitle': 'Resurs taklif qilganingiz uchun rahmat. Bizning jamoamiz uni ko\'rib chiqadi va agar u bizning mezonlarimizga javob bersa, katalogga qo\'shadi.',
    'submit.back': 'Katalogga qaytish',
    'submit.form.name': 'Resurs nomi',
    'submit.form.category': 'Kategoriya',
    'submit.form.category_placeholder': 'Kategoriyani tanlang',
    'submit.form.type': 'Resurs turi',
    'submit.form.image': 'Rasm/logotip URL manzili',
    'submit.form.short_desc': 'Qisqa tavsif',
    'submit.form.full_desc': 'To\'liq tavsif',
    'submit.form.purpose': 'Asosiy maqsad',
    'submit.form.pricing': 'To\'lov modeli',
    'submit.form.link': 'Rasmiy saytga havola',
    'submit.form.subscription': 'Obuna narxi (agar bo\'lsa)',
    'submit.form.platforms': 'Mavjud platformalar',
    'submit.form.alternatives': 'Muqobillar (vergul bilan ajrating)',
    'submit.form.audience': 'Bu resurs kim uchun?',
    'submit.form.pros': 'Afzalliklari (vergul bilan ajrating)',
    'submit.form.cons': 'Kamchiliklari (vergul bilan ajrating)',
    'submit.form.submit': 'Ariza yuborish',
    'submit.form.submitting': 'Yuborilmoqda...',
    'submit.form.disclaimer': 'Ariza yuborish orqali siz ushbu ma\'lumotlar bizning jamoamiz tomonidan ko\'rib chiqilishiga rozilik bildirasiz.',
    'item.views': 'Ko\'rishlar',
    'item.clicks': 'O\'tishlar',
    'item.reviews_count': 'Sharhlar',
    'item.about': 'Resurs haqida',
    'item.new_review': 'Yangi sharh',
    'item.your_name': 'Ismingiz (ixtiyoriy)',
    'item.your_rating': 'Sizning bahoingiz',
    'item.your_comment': 'Sizning sharhingiz',
    'item.cancel': 'Bekor qilish',
    'item.publish': 'Chop etish',
    'item.just_now': 'Hozirgina',
    'footer.subtitle': 'Professional kataloglar platformasi.',
    'admin.login.title': 'Admin uchun kirish',
    'admin.login.password_label': 'Admin parolini kiriting',
    'admin.login.error': 'Noto\'g\'ri parol. Yana urinib ko\'ring.',
    'admin.login.submit': 'Panelni ochish',
    'feedback.title': 'Siz {name} saytiga tashrif buyurdingiz',
    'feedback.question': 'Sizga yoqdimi?',
    'feedback.rate': 'Baholang',
    'feedback.comment': 'Sizning sharhingiz',
    'feedback.submit': 'Yuborish',
    'feedback.close': 'Yopish',
    'admin.title': 'Admin kirish',
    'admin.password': 'Admin parolini kiriting',
    'admin.unlock': 'Panelni ochish',
    'admin.error': 'Noto\'g\'ri parol. Qayta urinib ko\'ring.',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'uz';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  const translate = async (text: string) => {
    return translateText(text, language);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const TranslatedText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
  const { language } = useLanguage();
  const [translated, setTranslated] = React.useState(text);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (language === 'ru' || !text) {
      setTranslated(text);
      return;
    }

    let isMounted = true;
    setLoading(true);
    
    translateText(text, language).then((result) => {
      if (isMounted) {
        setTranslated(result);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [text, language]);

  return (
    <span className={className}>
      {translated}
      {loading && <span className="ml-1 opacity-50 animate-pulse">...</span>}
    </span>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

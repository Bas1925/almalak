import type { Localized } from "@/types";

/**
 * Policy & FAQ content, shown at /[locale]/policies/[slug] and linked from the
 * footer. Content is a sensible starting point for the shop — the owner should
 * review and adjust specifics (return window, delivery areas/fees) as needed.
 */

export type PolicySlug = "privacy" | "returns" | "shipping" | "faq";

export interface PolicySection {
  heading: Localized;
  body: Localized[];
}

export interface Policy {
  slug: PolicySlug;
  title: Localized;
  intro: Localized;
  sections: PolicySection[];
}

export const policySlugs: PolicySlug[] = ["privacy", "returns", "shipping", "faq"];

export const policies: Record<PolicySlug, Policy> = {
  privacy: {
    slug: "privacy",
    title: { ar: "سياسة الخصوصية", en: "Privacy Policy", he: "מדיניות פרטיות" },
    intro: {
      ar: "خصوصيتك تهمّنا. توضّح هذه السياسة كيف نتعامل مع معلوماتك عند الطلب من الملاك.",
      en: "Your privacy matters to us. This policy explains how we handle your information when you order from Al Malak.",
      he: "הפרטיות שלך חשובה לנו. מדיניות זו מסבירה כיצד אנו מטפלים במידע שלך בעת הזמנה מאל מלאכ.",
    },
    sections: [
      {
        heading: { ar: "المعلومات التي نجمعها", en: "Information we collect", he: "איזה מידע אנו אוספים" },
        body: [
          {
            ar: "عند الطلب عبر واتساب نجمع: الاسم، رقم الهاتف، عنوان التوصيل، وتفاصيل طلبك.",
            en: "When you order via WhatsApp we collect your name, phone number, delivery address, and order details.",
            he: "בעת הזמנה בוואטסאפ אנו אוספים את שמך, מספר הטלפון, כתובת המשלוח ופרטי ההזמנה.",
          },
        ],
      },
      {
        heading: { ar: "كيف نستخدم معلوماتك", en: "How we use your information", he: "כיצד אנו משתמשים במידע" },
        body: [
          {
            ar: "نستخدم معلوماتك فقط لتجهيز طلبك وتوصيله والتواصل معك بخصوصه.",
            en: "We use your information only to prepare and deliver your order and to contact you about it.",
            he: "אנו משתמשים במידע אך ורק להכנת ההזמנה, אספקתה ויצירת קשר בנוגע אליה.",
          },
        ],
      },
      {
        heading: { ar: "حماية ومشاركة البيانات", en: "Data protection & sharing", he: "הגנה ושיתוף מידע" },
        body: [
          {
            ar: "لا نبيع معلوماتك ولا نشاركها مع أي طرف ثالث لأغراض تسويقية. نحتفظ بها بشكل آمن وللمدة اللازمة لإتمام طلبك فقط.",
            en: "We never sell your information or share it with third parties for marketing. We keep it securely and only for as long as needed to fulfil your order.",
            he: "איננו מוכרים את המידע ואיננו משתפים אותו עם צד שלישי לצורכי שיווק. אנו שומרים אותו באופן מאובטח ולמשך הזמן הנדרש בלבד.",
          },
        ],
      },
      {
        heading: { ar: "التواصل معنا", en: "Contact us", he: "צור קשר" },
        body: [
          {
            ar: "لأي استفسار حول خصوصيتك أو لطلب حذف بياناتك، تواصل معنا عبر واتساب أو الهاتف.",
            en: "For any question about your privacy or to request deletion of your data, contact us on WhatsApp or by phone.",
            he: "לכל שאלה בנוגע לפרטיות או לבקשת מחיקת מידע, צרו קשר בוואטסאפ או בטלפון.",
          },
        ],
      },
    ],
  },

  returns: {
    slug: "returns",
    title: { ar: "سياسة الاستبدال والإرجاع", en: "Returns & Exchange Policy", he: "מדיניות החזרות והחלפות" },
    intro: {
      ar: "نريد أن تكون سعيداً بكل طلب. فيما يلي شروط الاستبدال والإرجاع.",
      en: "We want you to be happy with every order. Below are our exchange and return terms.",
      he: "אנו רוצים שתהיו מרוצים מכל הזמנה. להלן תנאי ההחלפה וההחזרה.",
    },
    sections: [
      {
        heading: { ar: "الاستبدال", en: "Exchanges", he: "החלפות" },
        body: [
          {
            ar: "يمكن استبدال المنتجات غير المخصّصة وغير المستخدمة خلال 7 أيام من الاستلام، مع إثبات الشراء وبحالتها الأصلية.",
            en: "Non-personalized, unused products can be exchanged within 7 days of receipt, with proof of purchase and in their original condition.",
            he: "מוצרים שאינם מותאמים אישית ושלא נעשה בהם שימוש ניתנים להחלפה תוך 7 ימים מהקבלה, בצירוף הוכחת רכישה ובמצבם המקורי.",
          },
        ],
      },
      {
        heading: { ar: "منتجات غير قابلة للإرجاع", en: "Non-returnable items", he: "פריטים שאינם ניתנים להחזרה" },
        body: [
          {
            ar: "لا يمكن إرجاع الورود والتنسيقات الطبيعية، والمنتجات المطبوعة والمخصّصة (الأكواب، البراويز، وغيرها) إلا في حال وجود عيب أو تلف.",
            en: "Fresh flowers and natural arrangements, and printed or personalized items (mugs, frames, etc.) cannot be returned unless they are defective or damaged.",
            he: "פרחים טריים וסידורים טבעיים, ופריטים מודפסים או מותאמים אישית (ספלים, מסגרות וכו') אינם ניתנים להחזרה אלא אם הם פגומים או ניזוקו.",
          },
        ],
      },
      {
        heading: { ar: "المنتجات التالفة", en: "Damaged or faulty items", he: "פריטים פגומים" },
        body: [
          {
            ar: "إذا وصلك المنتج تالفاً أو به عيب، تواصل معنا خلال 24 ساعة مع صور، وسنستبدله أو نعيد قيمته.",
            en: "If an item arrives damaged or faulty, contact us within 24 hours with photos and we'll replace it or refund you.",
            he: "אם פריט מגיע פגום או לקוי, צרו קשר תוך 24 שעות בצירוף תמונות ונחליף אותו או נחזיר את התשלום.",
          },
        ],
      },
      {
        heading: { ar: "كيفية طلب الاستبدال", en: "How to request an exchange", he: "כיצד לבקש החלפה" },
        body: [
          {
            ar: "تواصل معنا عبر واتساب مع تفاصيل طلبك والمشكلة وسنساعدك فوراً.",
            en: "Contact us on WhatsApp with your order and the details, and we'll help you right away.",
            he: "צרו קשר בוואטסאפ עם פרטי ההזמנה והבעיה ונסייע לכם מיד.",
          },
        ],
      },
    ],
  },

  shipping: {
    slug: "shipping",
    title: { ar: "سياسة الشحن والتوصيل", en: "Shipping & Delivery Policy", he: "מדיניות משלוחים" },
    intro: {
      ar: "نوصل هداياك بعناية. إليك تفاصيل التوصيل والاستلام.",
      en: "We deliver your gifts with care. Here are our delivery and pickup details.",
      he: "אנו מספקים את המתנות שלך בקפידה. להלן פרטי המשלוח והאיסוף.",
    },
    sections: [
      {
        heading: { ar: "مناطق التوصيل", en: "Delivery areas", he: "אזורי משלוח" },
        body: [
          {
            ar: "نوصل داخل كفر مندا والمناطق المجاورة. تواصل معنا لتأكيد التوفّر والتكلفة لمنطقتك.",
            en: "We deliver within Kafr Manda and nearby areas. Contact us to confirm availability and the fee for your area.",
            he: "אנו מספקים בכפר מנדא ובאזורים הסמוכים. צרו קשר לאישור זמינות ועלות לאזורכם.",
          },
        ],
      },
      {
        heading: { ar: "أوقات التوصيل", en: "Delivery times", he: "זמני אספקה" },
        body: [
          {
            ar: "يتم الاتفاق على وقت التوصيل عند الطلب، ونحرص على التسليم في الموعد المناسب.",
            en: "Delivery time is arranged when you order, and we do our best to deliver on time.",
            he: "זמן האספקה נקבע בעת ההזמנה, ואנו עושים כמיטב יכולתנו לספק בזמן.",
          },
        ],
      },
      {
        heading: { ar: "الاستلام من المحل", en: "Store pickup", he: "איסוף עצמי" },
        body: [
          {
            ar: "يمكنك أيضاً استلام طلبك من المحل في كفر مندا.",
            en: "You can also pick up your order from our store in Kafr Manda.",
            he: "ניתן גם לאסוף את ההזמנה מהחנות בכפר מנדא.",
          },
        ],
      },
      {
        heading: { ar: "الدفع", en: "Payment", he: "תשלום" },
        body: [
          {
            ar: "الدفع نقداً عند الاستلام أو عند التوصيل.",
            en: "Payment is in cash on pickup or on delivery.",
            he: "התשלום במזומן בעת האיסוף או המסירה.",
          },
        ],
      },
    ],
  },

  faq: {
    slug: "faq",
    title: { ar: "الأسئلة الشائعة", en: "Frequently Asked Questions", he: "שאלות נפוצות" },
    intro: {
      ar: "إجابات سريعة على أكثر الأسئلة شيوعاً.",
      en: "Quick answers to the most common questions.",
      he: "תשובות מהירות לשאלות הנפוצות.",
    },
    sections: [
      {
        heading: { ar: "كيف أطلب؟", en: "How do I order?", he: "איך מזמינים?" },
        body: [
          {
            ar: "تصفّح المنتجات وأضفها للسلة أو استخدم «صمّم هديتك»، ثم أرسل طلبك عبر واتساب وسنؤكّده معك.",
            en: 'Browse products and add them to your cart, or use "Design Your Gift", then send your order via WhatsApp and we\'ll confirm it with you.',
            he: 'עיינו במוצרים והוסיפו לעגלה או השתמשו ב"עצב מתנה", ואז שלחו את ההזמנה בוואטסאפ ונאשר אותה.',
          },
        ],
      },
      {
        heading: { ar: "ما هي طرق الدفع؟", en: "What payment methods do you accept?", he: "אילו אמצעי תשלום?" },
        body: [
          {
            ar: "الدفع نقداً عند الاستلام أو التوصيل.",
            en: "Payment is in cash on pickup or delivery.",
            he: "תשלום במזומן באיסוף או במסירה.",
          },
        ],
      },
      {
        heading: { ar: "هل يمكنني تخصيص هدية؟", en: "Can I personalize a gift?", he: "אפשר להתאים מתנה אישית?" },
        body: [
          {
            ar: "نعم، استخدم قسم «صمّم هديتك» لإضافة صورة ونص على كوب أو برواز أو غيرها.",
            en: 'Yes — use the "Design Your Gift" section to add a photo and text to a mug, frame and more.',
            he: 'כן — השתמשו בקטע "עצב מתנה" להוספת תמונה וטקסט לספל, מסגרת ועוד.',
          },
        ],
      },
      {
        heading: { ar: "هل توصلون الطلبات؟", en: "Do you deliver?", he: "האם אתם מספקים משלוחים?" },
        body: [
          {
            ar: "نعم، داخل كفر مندا والمناطق المجاورة، كما يمكن الاستلام من المحل.",
            en: "Yes, within Kafr Manda and nearby areas, and pickup is also available.",
            he: "כן, בכפר מנדא ובסביבה, וכן ניתן לאסוף מהחנות.",
          },
        ],
      },
      {
        heading: { ar: "كيف أتواصل معكم؟", en: "How can I contact you?", he: "איך יוצרים קשר?" },
        body: [
          {
            ar: "عبر واتساب أو الهاتف: 050-901-1449.",
            en: "Via WhatsApp or phone: 050-901-1449.",
            he: "בוואטסאפ או בטלפון: 050-901-1449.",
          },
        ],
      },
    ],
  },
};

export function getPolicy(slug: string): Policy | undefined {
  return (policies as Record<string, Policy>)[slug];
}

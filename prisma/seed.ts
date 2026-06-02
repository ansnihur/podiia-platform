import { PrismaClient, Role, EventStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.feedback.deleteMany();
  await prisma.material.deleteMany();
  await prisma.speaker.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const hashPw = (pw: string) => bcrypt.hashSync(pw, 10);

  // ── Users ──────────────────────────────────────────────────────────────────

  const admin = await prisma.user.create({ data: { name: 'Admin User', email: 'admin@events.dev', password: hashPw('admin123'), role: Role.ADMIN } });
  const organizer = await prisma.user.create({ data: { name: 'Sarah Mitchell', email: 'organizer@events.dev', password: hashPw('organizer123'), role: Role.ORGANIZER } });
  const speaker1 = await prisma.user.create({ data: { name: 'Dr. James Chen', email: 'speaker@events.dev', password: hashPw('speaker123'), role: Role.SPEAKER } });
  const speaker2 = await prisma.user.create({ data: { name: 'Олексій Коваленко', email: 'speaker2@events.dev', password: hashPw('speaker123'), role: Role.SPEAKER } });
  const participant1 = await prisma.user.create({ data: { name: 'Emma Watson', email: 'participant@events.dev', password: hashPw('participant123'), role: Role.PARTICIPANT } });
  const participant2 = await prisma.user.create({ data: { name: 'Alex Rivera', email: 'alex@events.dev', password: hashPw('alex123'), role: Role.PARTICIPANT } });

  // Додаткові учасники для реалістичності
  const extraUsers = await Promise.all([
    prisma.user.create({ data: { name: 'Марія Шевченко', email: 'maria@events.dev', password: hashPw('pass123'), role: Role.PARTICIPANT } }),
    prisma.user.create({ data: { name: 'Іван Петренко', email: 'ivan@events.dev', password: hashPw('pass123'), role: Role.PARTICIPANT } }),
    prisma.user.create({ data: { name: 'Sofiya Bondarenko', email: 'sofiya@events.dev', password: hashPw('pass123'), role: Role.PARTICIPANT } }),
    prisma.user.create({ data: { name: 'Dmytro Kovalchuk', email: 'dmytro@events.dev', password: hashPw('pass123'), role: Role.PARTICIPANT } }),
    prisma.user.create({ data: { name: 'Oksana Hrytsenko', email: 'oksana@events.dev', password: hashPw('pass123'), role: Role.PARTICIPANT } }),
    prisma.user.create({ data: { name: 'Andrii Lysenko', email: 'andrii@events.dev', password: hashPw('pass123'), role: Role.PARTICIPANT } }),
    prisma.user.create({ data: { name: 'Natalia Savchenko', email: 'natalia@events.dev', password: hashPw('pass123'), role: Role.PARTICIPANT } }),
    prisma.user.create({ data: { name: 'Viktor Moroz', email: 'viktor@events.dev', password: hashPw('pass123'), role: Role.PARTICIPANT } }),
    prisma.user.create({ data: { name: 'Yulia Tkachenko', email: 'yulia@events.dev', password: hashPw('pass123'), role: Role.PARTICIPANT } }),
    prisma.user.create({ data: { name: 'Roman Kravchenko', email: 'roman@events.dev', password: hashPw('pass123'), role: Role.PARTICIPANT } }),
  ]);

  const allParticipants = [participant1, participant2, admin, ...extraUsers];

  // ── Upcoming events ────────────────────────────────────────────────────────

  const event1 = await prisma.event.create({
    data: {
      title: 'Зустріч випускників Mate Academy Kyiv',
      description: 'Неформальна зустріч alumni Mate Academy у Києві — можливість зустрітися з однокурсниками, поділитися досвідом роботи в IT та познайомитися з новим поколінням випускників. У програмі: нетворкінг, лайтнінг-токи від учасників, спільне фото та вечірня атмосфера. Вхід вільний для всіх випускників.',
      date: new Date('2026-07-15T18:00:00+03:00'),
      location: 'Mate Academy, вул. Хрещатик 22, Київ',
      capacity: 80,
      status: EventStatus.PUBLISHED,
      organizerId: organizer.id,
      tags: ['Social', 'Community'],
      imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800',
    },
  });

  const event2 = await prisma.event.create({
    data: {
      title: 'Python для початківців — безкоштовний воркшоп',
      description: 'Практичний одноденний воркшоп для тих, хто хоче зробити перший крок у програмуванні. Ми разом встановимо середовище, напишемо перші програми та розберемо базові концепції Python: змінні, цикли, функції. Ноутбук та бажання вчитися — єдине, що потрібно. Досвід не потрібен.',
      date: new Date('2026-08-03T10:00:00+03:00'),
      location: 'IT Cluster, вул. Городоцька 34, Львів',
      capacity: 30,
      status: EventStatus.PUBLISHED,
      organizerId: organizer.id,
      tags: ['Workshop', 'Technology'],
      imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab19836100?w=800',
    },
  });

  const event3 = await prisma.event.create({
    data: {
      title: 'Міжнародна конференція з AI та ML 2026',
      description: 'Найбільший AI-захід року в Україні. Дві сцени, 40+ доповідачів із Google, Microsoft, EPAM, Grammarly, Reface та провідних університетів. У програмі: LLM-агенти, computer vision, MLOps, AI-безпека та панельні дискусії.',
      date: new Date('2026-09-20T09:00:00+03:00'),
      location: 'Палац Спорту, просп. Спортивний 1, Київ',
      capacity: 500,
      status: EventStatus.PUBLISHED,
      organizerId: organizer.id,
      tags: ['AI', 'Technology', 'Research'],
      imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800',
    },
  });

  const event4 = await prisma.event.create({
    data: {
      title: 'Академічний воркшоп з наукового письма',
      description: 'Онлайн-інтенсив для аспірантів і молодих дослідників, які прагнуть публікуватися в міжнародних журналах. Розберемо структуру наукової статті, типові помилки, як відповідати рецензентам і як обрати правильний журнал.',
      date: new Date('2026-10-10T11:00:00+03:00'),
      location: 'Онлайн (Zoom)',
      capacity: 50,
      status: EventStatus.PUBLISHED,
      organizerId: organizer.id,
      tags: ['Workshop', 'Research', 'Academia'],
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
    },
  });

  const event5 = await prisma.event.create({
    data: {
      title: 'Культурний фестиваль студентів КНЕУ',
      description: 'Щорічний фестиваль КНЕУ, де студенти з усіх факультетів демонструють таланти, культуру та творчість. Живі виступи, танці народів світу, кулінарні майстер-класи, виставка студентських проєктів.',
      date: new Date('2026-11-05T13:00:00+02:00'),
      location: 'КНЕУ, просп. Перемоги 54/1, Київ',
      capacity: 2000,
      status: EventStatus.PUBLISHED,
      organizerId: organizer.id,
      tags: ['Social', 'Culture', 'Festival'],
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
    },
  });

  const event6 = await prisma.event.create({
    data: {
      title: 'Hackathon: EdTech Solutions',
      description: '48-годинний хакатон для студентів та молодих розробників, де команди будують рішення для освіти майбутнього. Трекі: адаптивне навчання, AI-тьютори, геймифікація. Призовий фонд — 150 000 грн.',
      date: new Date('2026-11-28T10:00:00+02:00'),
      location: 'Unit.City, вул. Дорогожицька 3, Київ',
      capacity: 120,
      status: EventStatus.PUBLISHED,
      organizerId: organizer.id,
      tags: ['Technology', 'Workshop'],
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
    },
  });

  // ── Past events ────────────────────────────────────────────────────────────

  const event7 = await prisma.event.create({
    data: {
      title: "DOU Talks: Кар'єра в IT у 2026",
      description: "Практична конференція від спільноти DOU про побудову кар'єри в IT у реаліях 2026 року. Доповідачі: CTO та hiring-менеджери провідних компаній. Теми: ринок праці, технічні співбесіди, remote vs офіс.",
      date: new Date('2026-03-10T10:00:00+02:00'),
      location: 'IZONE Creative Community, вул. Набережно-Лугова 8, Київ',
      capacity: 200,
      status: EventStatus.COMPLETED,
      organizerId: organizer.id,
      tags: ['Technology', 'Community'],
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    },
  });

  const event8 = await prisma.event.create({
    data: {
      title: 'Весняна наукова конференція КНЕУ',
      description: 'Щорічна наукова конференція КНЕУ. Секції: економіка, фінанси, менеджмент, маркетинг, цифрова трансформація. Запрошуються студенти, аспіранти та викладачі для представлення наукових доповідей.',
      date: new Date('2026-04-15T09:00:00+03:00'),
      location: 'КНЕУ, Великий актовий зал, просп. Перемоги 54/1, Київ',
      capacity: 150,
      status: EventStatus.COMPLETED,
      organizerId: organizer.id,
      tags: ['Research', 'Academia'],
      imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
    },
  });

  const event9 = await prisma.event.create({
    data: {
      title: 'Щорічний Технологічний Саміт',
      description: 'Масштабний технологічний саміт з фокусом на інновації, стартапи та цифрову трансформацію бізнесу. 20+ спікерів, панельні дискусії, нетворкінг-зона та виставка стартапів.',
      date: new Date('2026-06-10T09:00:00+03:00'),
      location: 'Kyiv Expo Plaza, просп. Броварський 15, Київ',
      capacity: 300,
      status: EventStatus.COMPLETED,
      organizerId: organizer.id,
      tags: ['Technology', 'Community', 'Research'],
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
    },
  });

  // ── Speakers ───────────────────────────────────────────────────────────────

  const speakerSlot = await prisma.speaker.create({
    data: {
      userId: speaker1.id,
      eventId: event3.id,
      topic: 'LLM-агенти у 2026: від прототипу до production',
      bio: 'Dr. James Chen — профессор Computer Science у MIT, 15+ років досвіду в NLP та глибокому навчанні, автор 3 підручників і 80+ публікацій.',
    },
  });

  await prisma.material.create({
    data: {
      title: 'Слайди: LLM-агенти у production',
      fileUrl: 'https://example.com/materials/llm-agents-2026.pdf',
      speakerId: speakerSlot.id,
      eventId: event3.id,
    },
  });

  await prisma.speaker.create({
    data: {
      userId: speaker2.id,
      eventId: event3.id,
      topic: 'Застосування LLM у навчальних системах',
      bio: 'Дослідник у сфері штучного інтелекту, PhD з комп\'ютерних наук, 8 років досвіду в ML.',
    },
  });

  // ── Реалістичні реєстрації ─────────────────────────────────────────────────

  // event7 (DOU Talks, capacity 200) — завершена, ~160 учасників → всі 12 тестових
  await prisma.registration.createMany({
    data: allParticipants.map(u => ({ userId: u.id, eventId: event7.id, status: 'CONFIRMED' })),
  });

  // event8 (КНЕУ конференція, capacity 150) — завершена, ~110 учасників → 10 тестових
  await prisma.registration.createMany({
    data: allParticipants.slice(0, 10).map(u => ({ userId: u.id, eventId: event8.id, status: 'CONFIRMED' })),
  });

  // event9 (Саміт, capacity 300) — завершена, ~240 учасників → всі 12 тестових
  await prisma.registration.createMany({
    data: allParticipants.map(u => ({ userId: u.id, eventId: event9.id, status: 'CONFIRMED' })),
  });

  // event1 (Mate Academy, capacity 80) — майбутня, ~45 зареєстровано → 8 тестових
  await prisma.registration.createMany({
    data: allParticipants.slice(0, 8).map(u => ({ userId: u.id, eventId: event1.id, status: 'CONFIRMED' })),
  });

  // event2 (Python воркшоп, capacity 30) — майбутня, майже заповнена → 10 тестових
  await prisma.registration.createMany({
    data: allParticipants.slice(0, 10).map(u => ({ userId: u.id, eventId: event2.id, status: 'CONFIRMED' })),
  });

  // event3 (AI конференція, capacity 500) — майбутня, активна реєстрація → 7 тестових
  await prisma.registration.createMany({
    data: allParticipants.slice(0, 7).map(u => ({ userId: u.id, eventId: event3.id, status: 'CONFIRMED' })),
  });

  // ── Відгуки для завершених подій ──────────────────────────────────────────

  await prisma.feedback.createMany({
    data: [
      { userId: participant1.id, eventId: event7.id, rating: 5, comment: 'Дуже корисна конференція! Доповідь про hiring-процеси повністю змінила моє розуміння підготовки до співбесід. Обов\'язково прийду наступного року.' },
      { userId: participant2.id, eventId: event7.id, rating: 4, comment: 'Чудові спікери, хороша організація. Хотілося б більше часу на Q&A — деякі питання залишились без відповіді.' },
      { userId: extraUsers[0].id, eventId: event7.id, rating: 5, comment: 'Найкраща IT-конференція на якій я була. Особливо сподобалась панельна дискусія про remote роботу.' },
      { userId: extraUsers[1].id, eventId: event7.id, rating: 4, comment: 'Корисний контент, хороший нетворкінг. Трохи не вистачило практичних кейсів.' },
      { userId: extraUsers[2].id, eventId: event7.id, rating: 5, comment: 'Відмінна подія! Познайомилась з майбутніми колегами і отримала оффер після нетворкінгу 🎉' },

      { userId: participant1.id, eventId: event8.id, rating: 5, comment: 'Відмінна конференція для молодих науковців. Отримала цінний фідбек на свою доповідь.' },
      { userId: participant2.id, eventId: event8.id, rating: 4, comment: 'Цікаві секції, особливо по цифровій трансформації. Організація на високому рівні.' },
      { userId: extraUsers[3].id, eventId: event8.id, rating: 5, comment: 'Вперше виступав на конференції такого рівня — дуже підтримуюча атмосфера.' },
      { userId: extraUsers[4].id, eventId: event8.id, rating: 3, comment: 'Непогано, але деякі доповіді були занадто теоретичними. Хочеться більше практики.' },

      { userId: participant1.id, eventId: event9.id, rating: 5, comment: 'Масштабна подія! Стартап-виставка була особливо цікавою — побачила багато інноваційних проєктів.' },
      { userId: participant2.id, eventId: event9.id, rating: 5, comment: 'Чудова організація, топові спікери. Точно прийду наступного разу.' },
      { userId: extraUsers[0].id, eventId: event9.id, rating: 4, comment: 'Дуже насичена програма, не встигла на всі сесії які хотіла. Але загальне враження відмінне.' },
      { userId: extraUsers[5].id, eventId: event9.id, rating: 5, comment: 'Найкращий саміт за останні роки. Нетворкінг-зона — просто вогонь!' },
    ],
  });

  console.log('✅ Seeding complete!');
  console.log('\n📋 Test Accounts:');
  console.log('  Admin:       admin@events.dev / admin123');
  console.log('  Organizer:   organizer@events.dev / organizer123');
  console.log('  Speaker:     speaker@events.dev / speaker123');
  console.log('  Participant: participant@events.dev / participant123');
  console.log('  Participant: alex@events.dev / alex123');
  console.log('\n📅 Events: 6 upcoming, 3 completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

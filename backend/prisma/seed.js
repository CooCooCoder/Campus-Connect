const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CampusConnect database...');

  // Clean existing data for reproducible idempotent execution
  await prisma.registration.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.club.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Seed Users
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Shivamsh Anil Menon',
        email: 'shivamsh.menon@campus.edu',
        role: 'ADMIN'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@campus.edu',
        role: 'ORGANIZER'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Priya Nair',
        email: 'priya.nair@campus.edu',
        role: 'STUDENT'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Rohan Verma',
        email: 'rohan.v@campus.edu',
        role: 'STUDENT'
      }
    })
  ]);
  console.log(`Created ${users.length} users`);

  // 2. Seed Clubs (8 Clubs across varied campus interests)
  const clubsData = [
    {
      name: 'CodeCraft Coding Club',
      slug: 'codecraft',
      description: 'The premier technical club fostering competitive programming, hackathons, and open source development.',
      category: 'Technology',
      contactEmail: 'codecraft@campus.edu',
      logoUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=120&auto=format&fit=crop&q=80'
    },
    {
      name: 'Robotics & AI Guild',
      slug: 'robotics-ai',
      description: 'Building autonomous rovers, drones, and AI computer vision systems for national robotics competitions.',
      category: 'Technology',
      contactEmail: 'robotics@campus.edu',
      logoUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=120&auto=format&fit=crop&q=80'
    },
    {
      name: 'Dhwani Music Society',
      slug: 'dhwani-music',
      description: 'Celebrating classical melodies, rock fusion, and acoustic musical talent across campus stages.',
      category: 'Cultural',
      contactEmail: 'dhwani@campus.edu',
      logoUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=120&auto=format&fit=crop&q=80'
    },
    {
      name: 'Nritya Dance Troupe',
      slug: 'nritya-dance',
      description: 'Expressing vibrant artistry through contemporary, hip-hop, and Indian classical dance choreographies.',
      category: 'Cultural',
      contactEmail: 'nritya@campus.edu',
      logoUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=120&auto=format&fit=crop&q=80'
    },
    {
      name: 'Apex Sports Syndicate',
      slug: 'apex-sports',
      description: 'Organizing inter-departmental tournaments in football, basketball, badminton, and athletics.',
      category: 'Sports',
      contactEmail: 'sports@campus.edu',
      logoUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=120&auto=format&fit=crop&q=80'
    },
    {
      name: 'ShutterUp Photography Club',
      slug: 'shutterup',
      description: 'Capturing memories, mastering photojournalism, visual storytelling, and cinematic filmmaking.',
      category: 'Arts & Media',
      contactEmail: 'shutterup@campus.edu',
      logoUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=120&auto=format&fit=crop&q=80'
    },
    {
      name: 'E-Cell Entrepreneurship Cell',
      slug: 'e-cell',
      description: 'Empowering student founders with pitch nights, venture mentorship, and investor networking.',
      category: 'Management',
      contactEmail: 'ecell@campus.edu',
      logoUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=120&auto=format&fit=crop&q=80'
    },
    {
      name: 'Literary & Debating Society',
      slug: 'literary-society',
      description: 'Hosting parliamentary debates, model united nations, slam poetry, and creative writing circles.',
      category: 'Literary',
      contactEmail: 'litdeb@campus.edu',
      logoUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=120&auto=format&fit=crop&q=80'
    }
  ];

  const clubs = {};
  for (const c of clubsData) {
    const club = await prisma.club.create({ data: c });
    clubs[c.slug] = club;
  }
  console.log(`Created ${Object.keys(clubs).length} clubs`);

  // 3. Seed Events (12 realistic campus events with varying capacities and dates)
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  const eventsData = [
    {
      title: 'HackCampus 2026: 24-Hour National Hackathon',
      description: 'Build cutting-edge web, mobile, and AI solutions over 24 intense hours. Cash pool of Rs. 1,00,000 and direct internship opportunities for winning teams.',
      category: 'Technical',
      venue: 'Main Auditorium & Innovation Lab',
      date: new Date(now.getTime() + 14 * day),
      capacity: 120,
      clubId: clubs['codecraft'].id,
      status: 'UPCOMING'
    },
    {
      title: 'Generative AI & LLM Engineering Masterclass',
      description: 'Hands-on workshop covering retrieval augmented generation (RAG), vector databases, and fine-tuning open source models.',
      category: 'Workshop',
      venue: 'Computer Science Lab 304',
      date: new Date(now.getTime() + 5 * day),
      capacity: 60,
      clubId: clubs['codecraft'].id,
      status: 'UPCOMING'
    },
    {
      title: 'Autonomous Drone Navigation Showcase',
      description: 'Live field demonstrations of obstacle avoidance and autonomous waypoint navigation designed by student engineering teams.',
      category: 'Technical',
      venue: 'Campus Central Quadrangle',
      date: new Date(now.getTime() + 10 * day),
      capacity: 80,
      clubId: clubs['robotics-ai'].id,
      status: 'UPCOMING'
    },
    {
      title: 'Acoustic Sunset Concert & Jam Session',
      description: 'An open-air evening filled with acoustic performances, instrumental solos, and campus band collaborations.',
      category: 'Cultural',
      venue: 'Amphitheatre',
      date: new Date(now.getTime() + 8 * day),
      capacity: 150,
      clubId: clubs['dhwani-music'].id,
      status: 'UPCOMING'
    },
    {
      title: 'Rhythm Revolution: Inter-College Dance Battle',
      description: 'High-energy crew battles spanning hip-hop, freestyle, and classical fusion with celebrity adjudicators.',
      category: 'Cultural',
      venue: 'Student Activity Center',
      date: new Date(now.getTime() + 20 * day),
      capacity: 100,
      clubId: clubs['nritya-dance'].id,
      status: 'UPCOMING'
    },
    {
      title: 'Campus Champions Cup: 7-a-Side Football Tournament',
      description: 'The flagship inter-department football trophy. Knockout rounds played under floodlights.',
      category: 'Sports',
      venue: 'Football Ground North',
      date: new Date(now.getTime() + 12 * day),
      capacity: 64,
      clubId: clubs['apex-sports'].id,
      status: 'UPCOMING'
    },
    {
      title: 'Smash & Volley: Badminton Open Championship',
      description: 'Singles and doubles tournaments for men and women with certified tournament referees.',
      category: 'Sports',
      venue: 'Indoor Sports Complex',
      date: new Date(now.getTime() + 18 * day),
      capacity: 48,
      clubId: clubs['apex-sports'].id,
      status: 'UPCOMING'
    },
    {
      title: 'Street & Portrait Photography Expedition',
      description: 'Learn aperture mastery, low-light framing, and post-processing techniques on a photowalk.',
      category: 'Workshop',
      venue: 'Old Heritage Campus Grounds',
      date: new Date(now.getTime() + 6 * day),
      capacity: 25,
      clubId: clubs['shutterup'].id,
      status: 'UPCOMING'
    },
    {
      title: 'Startup Pitch Battlefield: Angel Demo Day',
      description: 'Ten student-led ventures pitch to angel investors and industry founders for seed funding and incubation space.',
      category: 'Seminar',
      venue: 'Executive Seminar Hall B',
      date: new Date(now.getTime() + 16 * day),
      capacity: 90,
      clubId: clubs['e-cell'].id,
      status: 'UPCOMING'
    },
    {
      title: 'Great Campus Parliamentary Debate 2026',
      description: 'Oxford-style debates on technology ethics, global economics, and public policy with live audience polling.',
      category: 'Literary',
      venue: 'Conference Hall A',
      date: new Date(now.getTime() + 9 * day),
      capacity: 70,
      clubId: clubs['literary-society'].id,
      status: 'UPCOMING'
    },
    {
      title: 'Micro-Robotics soldering & PCB Design Workshop',
      description: 'Intensive hardware fabrication lab. All participants assemble their own sensor-tracking micro-robot to take home.',
      category: 'Workshop',
      venue: 'ECE Microcontroller Lab',
      date: new Date(now.getTime() + 3 * day),
      capacity: 3, // Small capacity to demonstrate Full Event state
      clubId: clubs['robotics-ai'].id,
      status: 'UPCOMING'
    },
    {
      title: 'Web3 & Decentralized Identity Symposium',
      description: 'Guest lecture from blockchain researchers on zero-knowledge proofs and digital identity architectures.',
      category: 'Seminar',
      venue: 'Seminar Hall 1',
      date: new Date(now.getTime() + 25 * day),
      capacity: 50,
      clubId: clubs['codecraft'].id,
      status: 'UPCOMING'
    }
  ];

  const createdEvents = [];
  for (const ev of eventsData) {
    const event = await prisma.event.create({ data: ev });
    createdEvents.push(event);
  }
  console.log(`Created ${createdEvents.length} events`);

  // 4. Seed Registrations (including a full event demonstration for the 3-capacity micro-robotics workshop)
  const fullEvent = createdEvents.find(e => e.capacity === 3);
  const hackathonEvent = createdEvents.find(e => e.title.startsWith('HackCampus'));

  const registrations = [
    // 3 registrations to completely fill the micro-robotics workshop
    {
      eventId: fullEvent.id,
      studentName: 'Shivamsh Anil Menon',
      studentEmail: 'shivamsh.menon@campus.edu',
      status: 'CONFIRMED'
    },
    {
      eventId: fullEvent.id,
      studentName: 'Aarav Sharma',
      studentEmail: 'aarav.sharma@campus.edu',
      status: 'CONFIRMED'
    },
    {
      eventId: fullEvent.id,
      studentName: 'Ananya Iyer',
      studentEmail: 'ananya.iyer@campus.edu',
      status: 'CONFIRMED'
    },
    // Partial registrations for HackCampus
    {
      eventId: hackathonEvent.id,
      studentName: 'Priya Nair',
      studentEmail: 'priya.nair@campus.edu',
      status: 'CONFIRMED'
    },
    {
      eventId: hackathonEvent.id,
      studentName: 'Rohan Verma',
      studentEmail: 'rohan.v@campus.edu',
      status: 'CONFIRMED'
    }
  ];

  for (const r of registrations) {
    await prisma.registration.create({ data: r });
  }

  // Update registeredCount counter caches
  await prisma.event.update({
    where: { id: fullEvent.id },
    data: { registeredCount: 3 }
  });

  await prisma.event.update({
    where: { id: hackathonEvent.id },
    data: { registeredCount: 2 }
  });

  console.log(`Created ${registrations.length} registrations`);
  console.log('Database seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

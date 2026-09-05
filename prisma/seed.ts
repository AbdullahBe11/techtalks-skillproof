import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Fictional test accounts (no real person data)
const SEED_DATA = {
  candidate: {
    email: 'candidate.test@example.com',
    password: 'Candidate123!',
    name: 'Alex Johnson',
    phoneNumber: '+1234567890',
    role: 'candidate' as const,
  },
  verifier: {
    email: 'verifier.test@example.com',
    password: 'Verifier123!',
    name: 'Sam Rivera',
    phoneNumber: '+1234567891',
    role: 'verifier' as const,
  },
  recruiter: {
    email: 'recruiter.test@example.com',
    password: 'Recruiter123!',
    name: 'Jordan Lee',
    phoneNumber: '+1234567892',
    role: 'recruiter' as const,
  },
};

async function main() {
  console.log('🌱 Starting database seed...');

  try {
    // Check if accounts already exist (prevent duplicates)
    const existingAccounts = await prisma.user.count();
    if (existingAccounts > 0) {
      console.log('⚠️  Database already has data. Skipping seed to avoid duplicates.');
      console.log('💡 To re-seed, first clear the database or run: npx prisma migrate reset');
      return;
    }

    // Hash passwords
    const saltRounds = 10;
    
    console.log('📝 Creating candidate account...');
    const candidate = await prisma.user.create({
      data: {
        name: SEED_DATA.candidate.name,
        email: SEED_DATA.candidate.email,
        password: await bcrypt.hash(SEED_DATA.candidate.password, saltRounds),
        role: SEED_DATA.candidate.role,
        phoneNumber: SEED_DATA.candidate.phoneNumber,
        profile: {
          create: {
            bio: 'Experienced developer with a passion for clean code and innovative solutions.',
          },
        },
      },
    });
    console.log(`   ✅ Created candidate: ${candidate.email}`);

    console.log('📝 Creating verifier account...');
    const verifier = await prisma.user.create({
      data: {
        name: SEED_DATA.verifier.name,
        email: SEED_DATA.verifier.email,
        password: await bcrypt.hash(SEED_DATA.verifier.password, saltRounds),
        role: SEED_DATA.verifier.role,
        phoneNumber: SEED_DATA.verifier.phoneNumber,
        profile: {
          create: {
            bio: 'Senior verifier with expertise in code review and quality assurance.',
          },
        },
      },
    });
    console.log(`   ✅ Created verifier: ${verifier.email}`);

    console.log('📝 Creating recruiter account...');
    const recruiter = await prisma.user.create({
      data: {
        name: SEED_DATA.recruiter.name,
        email: SEED_DATA.recruiter.email,
        password: await bcrypt.hash(SEED_DATA.recruiter.password, saltRounds),
        role: SEED_DATA.recruiter.role,
        phoneNumber: SEED_DATA.recruiter.phoneNumber,
        profile: {
          create: {
            bio: 'Talent acquisition specialist looking for top tech talent.',
          },
        },
      },
    });
    console.log(`   ✅ Created recruiter: ${recruiter.email}`);

    console.log('\n✅ Seed completed successfully!');
    console.log('📋 Created test accounts:');
    console.log(`   👤 Candidate: ${SEED_DATA.candidate.email}`);
    console.log(`      Password: ${SEED_DATA.candidate.password}`);
    console.log(`   👤 Verifier: ${SEED_DATA.verifier.email}`);
    console.log(`      Password: ${SEED_DATA.verifier.password}`);
    console.log(`   👤 Recruiter: ${SEED_DATA.recruiter.email}`);
    console.log(`      Password: ${SEED_DATA.recruiter.password}`);
    console.log('\n💡 You can now log in with any of these accounts.');
    console.log('📌 Role descriptions:');
    console.log('   - Candidate: Can submit projects for review');
    console.log('   - Verifier: Can review and verify projects');
    console.log('   - Recruiter: Can view verified projects and shortlist candidates');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  });
const config = require('./config');

async function seedDatabase(repository) {
  console.log('Starting database seeding...');

  // Check if data already exists
  const existingPersonas = await repository.getAllPersonas();
  if (existingPersonas.length > 0) {
    console.log('Database already seeded, skipping...');
    return;
  }

  console.log('Seeding personas...');
  const personas = [
    {
      name: 'Girlfriend Assistant',
      system_prompt: 'Peran: Pacar yang perhatian, baik, sopan, pintar, dan lucu. Tujuan: Membalas chat dengan hangat, bikin nyaman, dan kadang sedikit menggoda. Gaya: Soft, tidak kaku, santai, agak lebay gpp, singkat, ala gen z, tapi tetap romantis dan natural, sesekali gunakan emot ekspresi love,.'
    },
    {
      name: 'Bestie International',
      system_prompt: 'Peran: Teman yang ramah dan informatif. Respons dalam gaya santai dan profesional, seperti berbincang dengan sahabat.'
    },
    {
      name: 'Bestie Local',
      system_prompt: 'Peran: Teman yang dekat. Respons dalam gaya santai dan ramah, seperti berbincang dengan sahabat. mengunakan bahasa ternate maluku utara.'
    },
  ];

  const createdPersonas = [];
  for (const persona of personas) {
    const created = await repository.createPersona(persona);
    createdPersonas.push(created);
    console.log(`Created persona: ${created.name}`);
  }

  console.log('Seeding users...');
  const users = [
    {
      phone: '6285387092426',
      name: 'Salma',
      role: 'pacar',
      gender: 'female'
    },
    {
      phone: '6283141171461',
      name: 'Salma 2',
      role: 'pacar',
      gender: 'female'
    },
    {
      phone: '6287847522931',
      name: 'Nanda',
      role: 'teman baik',
      gender: 'female'
    },
    {
      phone: '6285156775261',
      name: 'Nadia',
      role: 'teman baik, tapi agak toxic',
      gender: 'female'
    },
    {
      phone: '6285333220781',
      name: 'Angga',
      role: 'teman baik, tapi toxic',
      gender: 'male'
    },
    {
      phone: '6281281866778',
      name: 'Ardian',
      role: 'teman baik, anak IT',
      gender: 'male'
    },
  ];

  const createdUsers = [];
  for (const user of users) {
    const created = await repository.createUser(user);
    createdUsers.push(created);
    console.log(`Created user: ${created.name} (${created.phone})`);
  }

  console.log('Assigning personas to users...');
  // Assign personas randomly or based on role
  const assignments = [
    { userIndex: 0, personaIndex: 0 }, // Salma gets Girlfriend Assistant
    { userIndex: 1, personaIndex: 0 }, // Salma 2 also gets Girlfriend Assistant
    { userIndex: 2, personaIndex: 1 }, // Nanda gets Bestie International
    { userIndex: 3, personaIndex: 1 }, // Nadia also gets Bestie International
    { userIndex: 4, personaIndex: 1 }, // Angga also gets Bestie International
    { userIndex: 5, personaIndex: 2 }, // Ardian gets Bestie Local
  ];

  for (const assignment of assignments) {
    const user = createdUsers[assignment.userIndex];
    const persona = createdPersonas[assignment.personaIndex];
    await repository.assignPersonaToUser(user.id, persona.id);
    console.log(`Assigned ${persona.name} to ${user.name}`);
  }

  console.log('Seeding global AI config...');
  const globalConfig = {
    name: 'Default Global Config',
    system_prompt: 'You are an AI assistant for WhatsApp. Respond naturally and helpfully to user messages. Keep responses concise but informative.'
  };

  await repository.createAIConfig(globalConfig);
  console.log('Created global AI config');

  console.log('Database seeding completed successfully!');
}

module.exports = seedDatabase;
const path = require('path');
const config = require('./config');
const PostgresRepository = require('./repository/postgresRepository');
const OpenAIService = require('./services/openAIService');
const GeminiService = require('./services/geminiService');
const GroqService = require('./services/groqService');
const AIService = require('./services/aiService');
const DelayMessageService = require('./services/delayMessageService');
const ReplyUsecase = require('./usecases/replyUsecase');
const WhatsAppClient = require('./services/whatsappClient');
const { createServer } = require('./server');

async function start() {
  if (!config.openAI.apiKey && !config.gemini.apiKey && !config.groq.apiKey) {
    throw new Error('OPENAI_API_KEY, GEMINI_API_KEY, or GROQ_API_KEY is required in environment.');
  }

  const repository = new PostgresRepository(config.db);
  await repository.connect();
  await repository.initializeSchema();

  // Seed database with dummy data if empty
  const existingPersonas = await repository.getAllPersonas();
  if (existingPersonas.length === 0) {
    console.log('Database is empty, seeding with dummy data...');
    const seedDatabase = require('./seed');
    await seedDatabase(repository);
  }

  const openAIService = config.openAI.apiKey ? new OpenAIService(config.openAI) : null;
  const geminiService = config.gemini.apiKey ? new GeminiService(config.gemini) : null;
  const groqService = config.groq.apiKey ? new GroqService(config.groq) : null;
  const aiService = new AIService(openAIService, geminiService, groqService);
  const replyUsecase = new ReplyUsecase(repository, aiService, config.whatsapp);

  const delayMessageService = new DelayMessageService(config.whatsapp, async (senderJid, combinedText, metadata) => {
    const reply = await replyUsecase.createReply(senderJid, combinedText, metadata);
    if (!reply) {
      console.warn('Index: delayed reply generated no content for', { senderJid });
      return;
    }

    const targetJid = metadata.remoteJid || senderJid;
    await whatsappClient.sendText(targetJid, reply);
    console.info(`Index: sent delayed reply to ${targetJid}: ${reply.slice(0, 120)}`);
  });

  const whatsappClient = new WhatsAppClient({
    sessionDir: path.resolve(process.cwd(), config.whatsapp.sessionDir),
    onMessage: async (payload) => {
      const { remoteJid, senderJid, senderPn, text } = payload;
      if (
        !remoteJid ||
        (!remoteJid.endsWith('@s.whatsapp.net') && !remoteJid.endsWith('@c.us') && !remoteJid.endsWith('@lid'))
      ) {
        return;
      }

      try {
        const assignedPersona = await repository.getUserPersonaByPhone(senderJid) ||
          (senderPn ? await repository.getUserPersonaByPhone(senderPn) : null);

        if (assignedPersona) {
          await delayMessageService.enqueue(senderJid, text, { senderPn, remoteJid });
          return;
        }

        // Removed: No longer reply to unassigned users
        console.info('Index: message from unassigned user, not replying', { remoteJid, senderJid, senderPn });
      } catch (error) {
        console.error('Index: failed to process message', error);
        // Don't crash the bot, just log the error
      }
    },
  });

  await whatsappClient.start();

  const app = createServer(config.app, whatsappClient, replyUsecase, repository);
  app.listen(config.app.port, () => {
    console.info(`Node WhatsApp bot running on http://localhost:${config.app.port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start WhatsApp bot service:', error);
  process.exit(1);
});

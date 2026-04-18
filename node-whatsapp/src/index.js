const path = require('path');
const config = require('./config');
const PostgresRepository = require('./repository/postgresRepository');
const OpenAIService = require('./services/aiService');
const ReplyUsecase = require('./usecases/replyUsecase');
const WhatsAppClient = require('./services/whatsappClient');
const { createServer } = require('./server');

async function start() {
  if (!config.openAI.apiKey) {
    throw new Error('OPENAI_API_KEY is required in environment.');
  }

  const repository = new PostgresRepository(config.db);
  await repository.connect();
  await repository.initializeSchema();

  const aiService = new OpenAIService(config.openAI);
  const replyUsecase = new ReplyUsecase(repository, aiService, config.whatsapp);

  const whatsappClient = new WhatsAppClient({
    sessionDir: path.resolve(process.cwd(), config.whatsapp.sessionDir),
    onMessage: async (payload) => {
      const { remoteJid, text } = payload;
      if (
        !remoteJid ||
        (!remoteJid.endsWith('@s.whatsapp.net') && !remoteJid.endsWith('@c.us') && !remoteJid.endsWith('@lid'))
      ) {
        return;
      }

      try {
        const reply = await replyUsecase.createReply(remoteJid, text);
        if (!reply) {
          console.warn('Index: no reply generated for message', { remoteJid });
          return;
        }

        await whatsappClient.sendText(remoteJid, reply);
        console.info(`Index: sent reply to ${remoteJid}: ${reply.slice(0, 120)}`);
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

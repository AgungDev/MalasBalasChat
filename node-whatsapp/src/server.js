const express = require('express');
const createPersonasController = require('./controllers/personasController');
const createUsersController = require('./controllers/usersController');
const { buildWhatsAppJid } = require('./utils/random');

function createServer(appConfig, whatsappClient, replyUsecase, repository) {
  const app = express();
  app.use(express.json());

  const personasController = createPersonasController(repository);
  const usersController = createUsersController(repository);

  app.get('/health', (req, res) => {
    res.json({ status: 'success', message: 'healthy', data: { status: 'ok' } });
  });

  app.get('/status', (req, res) => {
    res.json({ connected: Boolean(whatsappClient.socket) });
  });

  app.post('/personas', personasController.createPersona);
  app.get('/personas', personasController.listPersonas);
  app.get('/personas/:id', personasController.getPersona);
  app.put('/personas/:id', personasController.updatePersona);
  app.delete('/personas/:id', personasController.deletePersona);

  app.post('/users', usersController.createUser);
  app.get('/users', usersController.listUsers);
  app.get('/users/:phone', usersController.getUser);
  app.put('/users/:phone', usersController.updateUser);
  app.delete('/users/:phone', usersController.deleteUser);

  app.post('/users/:user_id/persona', usersController.assignPersona);
  app.delete('/users/:user_id/persona', usersController.removePersona);
  app.get('/users/:phone/persona', usersController.getUserPersona);

  app.post('/messages/handle', async (req, res) => {
    const { from, content } = req.body;
    console.info('Server: /messages/handle request', { from, contentPreview: content ? content.slice(0, 120) : null });

    if (!from || !content) {
      return res.status(400).json({ status: 'error', message: 'from and content are required' });
    }

    const targetJid = buildWhatsAppJid(from);
    if (!targetJid) {
      console.warn('Server: invalid from value provided to /messages/handle', { from });
      return res.status(400).json({ status: 'error', message: 'Invalid from value' });
    }

    try {
      const response = await replyUsecase.createReply(from, content);
      if (!response) {
        console.warn('Server: no reply generated for incoming handle request', { from });
        return res.status(404).json({ status: 'error', message: 'No reply generated for this contact or message' });
      }

      await whatsappClient.sendText(targetJid, response);
      console.info('Server: sent reply through WhatsApp', { sentTo: targetJid, replyPreview: response.slice(0, 120) });
      return res.json({
        status: 'success',
        message: 'Message handled successfully',
        data: { response, sentTo: targetJid },
      });
    } catch (error) {
      console.error('Server: error handling incoming message', error);
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to handle message' });
    }
  });

  app.post('/send', async (req, res) => {
    const { remoteJid, text } = req.body;
    console.info('Server: /send request', { remoteJid, textPreview: text ? text.slice(0, 120) : null });

    if (!remoteJid || !text) {
      return res.status(400).json({ status: 'error', message: 'remoteJid and text are required' });
    }

    const targetJid = buildWhatsAppJid(remoteJid);
    if (!targetJid) {
      console.warn('Server: invalid remoteJid value provided to /send', { remoteJid });
      return res.status(400).json({ status: 'error', message: 'Invalid remoteJid value' });
    }

    try {
      const result = await whatsappClient.sendText(targetJid, text);
      console.info('Server: message sent via WhatsApp', { sentTo: targetJid });
      return res.json({ status: 'success', message: 'Message sent successfully', data: { result, sentTo: targetJid } });
    } catch (error) {
      console.error('Server: error sending message via /send', error);
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to send message' });
    }
  });

  return app;
}

module.exports = { createServer };

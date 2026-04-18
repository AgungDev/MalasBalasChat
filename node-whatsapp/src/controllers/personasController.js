function createPersonasController(repository) {
  const createPersona = async (req, res) => {
    const { name, system_prompt } = req.body;
    if (!name || !system_prompt) {
      return res.status(400).json({ status: 'error', message: 'name and system_prompt are required' });
    }

    try {
      const persona = await repository.createPersona({ name, system_prompt });
      return res.json({ status: 'success', message: 'Persona created successfully', data: { id: persona.id } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to create persona' });
    }
  };

  const listPersonas = async (req, res) => {
    try {
      const personas = await repository.getAllPersonas();
      return res.json({ status: 'success', message: 'Personas fetched successfully', data: personas });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch personas' });
    }
  };

  const getPersona = async (req, res) => {
    const { id } = req.params;
    try {
      const persona = await repository.getPersonaById(id);
      if (!persona) {
        return res.status(404).json({ status: 'error', message: 'Persona not found' });
      }
      return res.json({ status: 'success', message: 'Persona fetched successfully', data: persona });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch persona' });
    }
  };

  const updatePersona = async (req, res) => {
    const { id } = req.params;
    const { name, system_prompt } = req.body;
    try {
      const persona = await repository.updatePersona(id, { name, system_prompt });
      if (!persona) {
        return res.status(404).json({ status: 'error', message: 'Persona not found' });
      }
      return res.json({ status: 'success', message: 'Persona updated successfully', data: persona });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to update persona' });
    }
  };

  const deletePersona = async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = await repository.deletePersona(id);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'Persona not found' });
      }
      return res.json({ status: 'success', message: 'Persona deleted successfully', data: {} });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to delete persona' });
    }
  };

  return {
    createPersona,
    listPersonas,
    getPersona,
    updatePersona,
    deletePersona,
  };
}

module.exports = createPersonasController;

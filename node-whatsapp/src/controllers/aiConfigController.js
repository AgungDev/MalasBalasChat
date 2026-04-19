function createAIConfigController(repository) {
  const createAIConfig = async (req, res) => {
    const { name, system_prompt } = req.body;
    if (!name || !system_prompt) {
      return res.status(400).json({ status: 'error', message: 'name and system_prompt are required' });
    }

    try {
      const config = await repository.createAIConfig({ name, system_prompt });
      return res.json({ status: 'success', message: 'AI config created successfully', data: { id: config.id } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to create AI config' });
    }
  };

  const listAIConfigs = async (req, res) => {
    try {
      const configs = await repository.getAllAIConfigs();
      return res.json({ status: 'success', message: 'AI configs fetched successfully', data: configs });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch AI configs' });
    }
  };

  const getAIConfig = async (req, res) => {
    const { id } = req.params;
    try {
      const config = await repository.getAIConfigById(id);
      if (!config) {
        return res.status(404).json({ status: 'error', message: 'AI config not found' });
      }
      return res.json({ status: 'success', message: 'AI config fetched successfully', data: config });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch AI config' });
    }
  };

  const updateAIConfig = async (req, res) => {
    const { id } = req.params;
    const { name, system_prompt } = req.body;
    if (name === undefined && system_prompt === undefined) {
      return res.status(400).json({ status: 'error', message: 'At least one of name or system_prompt is required' });
    }

    try {
      const config = await repository.updateAIConfig(id, { name, system_prompt });
      if (!config) {
        return res.status(404).json({ status: 'error', message: 'AI config not found' });
      }
      return res.json({ status: 'success', message: 'AI config updated successfully', data: config });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to update AI config' });
    }
  };

  const deleteAIConfig = async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = await repository.deleteAIConfig(id);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'AI config not found' });
      }
      return res.json({ status: 'success', message: 'AI config deleted successfully', data: {} });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to delete AI config' });
    }
  };

  const getActiveAIConfig = async (req, res) => {
    try {
      const config = await repository.getGlobalAIConfig();
      if (!config) {
        return res.status(404).json({ status: 'error', message: 'Global AI config not found' });
      }
      return res.json({ status: 'success', message: 'Global AI config fetched successfully', data: config });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch global AI config' });
    }
  };

  return {
    createAIConfig,
    listAIConfigs,
    getAIConfig,
    updateAIConfig,
    deleteAIConfig,
    getActiveAIConfig,
  };
}

module.exports = createAIConfigController;

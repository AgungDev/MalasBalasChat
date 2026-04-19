function createUsersController(repository) {
  const createUser = async (req, res) => {
    const { phone, name, role, gender } = req.body;
    if (!phone || !name || !role) {
      return res.status(400).json({ status: 'error', message: 'phone, name, and role are required' });
    }

    try {
      const user = await repository.createUser({ phone, name, role, gender });
      return res.json({ status: 'success', message: 'User created successfully', data: { id: user.id } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to create user' });
    }
  };

  const listUsers = async (req, res) => {
    try {
      const users = await repository.getAllUsers();
      return res.json({ status: 'success', message: 'Users fetched successfully', data: users });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch users' });
    }
  };

  const getUser = async (req, res) => {
    const { phone } = req.params;
    try {
      const user = await repository.getUserByPhone(phone);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
      return res.json({ status: 'success', message: 'User fetched successfully', data: user });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch user' });
    }
  };

  const updateUser = async (req, res) => {
    const { phone } = req.params;
    const { newPhone, name, role, gender } = req.body;
    if (!newPhone && !name && !role && !gender) {
      return res.status(400).json({ status: 'error', message: 'At least one of newPhone, name, role, or gender is required' });
    }

    try {
      const user = await repository.updateUserByPhone(phone, { newPhone, name, role, gender });
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
      return res.json({ status: 'success', message: 'User updated successfully', data: user });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to update user' });
    }
  };

  const deleteUser = async (req, res) => {
    const { phone } = req.params;
    try {
      const deleted = await repository.deleteUserByPhone(phone);
      if (!deleted) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }
      return res.json({ status: 'success', message: 'User deleted successfully', data: {} });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to delete user' });
    }
  };

  const assignPersona = async (req, res) => {
    const { user_id } = req.params;
    const { persona_id } = req.body;
    if (!persona_id) {
      return res.status(400).json({ status: 'error', message: 'persona_id is required' });
    }

    try {
      const user = await repository.getUserById(user_id);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      const persona = await repository.getPersonaById(persona_id);
      if (!persona) {
        return res.status(404).json({ status: 'error', message: 'Persona not found' });
      }

      await repository.assignPersonaToUser(user_id, persona_id);
      console.info('Controller: assigned persona to user', { user_id, persona_id });
      return res.json({ status: 'success', message: 'Persona assigned successfully', data: { user_id, persona_id } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to assign persona' });
    }
  };

  const removePersona = async (req, res) => {
    const { user_id } = req.params;

    try {
      const user = await repository.getUserById(user_id);
      if (!user) {
        return res.status(404).json({ status: 'error', message: 'User not found' });
      }

      const removed = await repository.removePersonaFromUser(user_id);
      if (!removed) {
        return res.status(404).json({ status: 'error', message: 'No persona assignment found for this user' });
      }

      console.info('Controller: removed persona from user', { user_id });
      return res.json({ status: 'success', message: 'Persona assignment removed successfully', data: { user_id } });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to remove persona' });
    }
  };

  const getUserPersona = async (req, res) => {
    const { phone } = req.params;
    try {
      const persona = await repository.getUserPersonaByPhone(phone);
      if (!persona) {
        return res.status(404).json({ status: 'error', message: 'Persona not found for user' });
      }
      return res.json({
        status: 'success',
        message: 'User persona fetched successfully',
        data: {
          id: persona.persona_id,
          name: persona.persona_name,
          system_prompt: persona.system_prompt,
        },
      });
    } catch (error) {
      return res.status(500).json({ status: 'error', message: error.message || 'Failed to fetch user persona' });
    }
  };

  return {
    createUser,
    listUsers,
    getUser,
    updateUser,
    deleteUser,
    assignPersona,
    removePersona,
    getUserPersona,
  };
}

module.exports = createUsersController;

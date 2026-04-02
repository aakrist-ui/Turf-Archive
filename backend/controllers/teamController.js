const Team = require('../models/team');
const User = require('../models/user');

// @desc    Create new team
// @route   POST /api/teams
// @access  Private
exports.createTeam = async (req, res) => {
  try {
    const { name, description, maxMembers } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Please provide team name' });
    }

    // Check if user already has a team
    const existingMembership = await User.findById(req.user.id).select('currentTeam');

    if (existingMembership?.currentTeam) {
      return res.status(400).json({ 
        message: 'You are already part of a team. Leave your current team before creating a new one.' 
      });
    }

    const team = await Team.create({
      name,
      captain: req.user.id,
      description,
      maxMembers: maxMembers || 10,
      members: [{
        user: req.user.id,
        position: req.user.position || 'Any'
      }]
    });

    // Update user's current team
    await User.findByIdAndUpdate(req.user.id, { currentTeam: team._id });

    const populatedTeam = await Team.findById(team._id)
      .populate('captain', 'name email position')
      .populate('members.user', 'name position profileImage');

    res.status(201).json({
      success: true,
      data: populatedTeam
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all teams
// @route   GET /api/teams
// @access  Public
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find({ isActive: true })
      .populate('captain', 'name email')
      .populate('members.user', 'name position')
      .sort('-createdAt');

    res.json({
      success: true,
      count: teams.length,
      data: teams
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single team
// @route   GET /api/teams/:id
// @access  Public
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('captain', 'name email phone profileImage')
      .populate('members.user', 'name position skillLevel profileImage');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({
      success: true,
      data: team
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my team
// @route   GET /api/teams/my-team
// @access  Private
exports.getMyTeam = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('currentTeam');

    if (!user?.currentTeam) {
      return res.status(404).json({ message: 'You don\'t have a team yet' });
    }

    const team = await Team.findById(user.currentTeam)
      .populate('captain', 'name email phone')
      .populate('members.user', 'name position skillLevel profileImage');

    if (!team) {
      return res.status(404).json({ message: 'You don\'t have a team yet' });
    }

    res.json({
      success: true,
      data: team
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to team
// @route   POST /api/teams/:id/members
// @access  Private
exports.addMember = async (req, res) => {
  try {
    const { userId, position } = req.body;

    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is captain
    if (team.captain.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team captain can add members' });
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ message: 'Team is full' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.currentTeam) {
      return res.status(400).json({ message: 'This player is already in a team' });
    }

    // Check if user is already in team
    const isMember = team.members.some(
      member => member.user.toString() === userId
    );

    if (isMember) {
      return res.status(400).json({ message: 'User is already a team member' });
    }

    // Add member
    team.members.push({
      user: userId,
      position: position || 'Any'
    });

    await team.save();

    // Update user's current team
    await User.findByIdAndUpdate(userId, { currentTeam: team._id });

    const updatedTeam = await Team.findById(team._id)
      .populate('members.user', 'name position profileImage');

    res.json({
      success: true,
      data: updatedTeam
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave team
// @route   DELETE /api/teams/:id/leave
// @access  Private
exports.leaveTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    if (team.captain.toString() === req.user.id) {
      return res.status(400).json({ message: 'Team captain cannot leave directly. Delete the team or transfer leadership first.' });
    }

    const isMember = team.members.some((member) => member.user.toString() === req.user.id);

    if (!isMember) {
      return res.status(400).json({ message: 'You are not a member of this team' });
    }

    team.members = team.members.filter((member) => member.user.toString() !== req.user.id);
    await team.save();

    await User.findByIdAndUpdate(req.user.id, { currentTeam: null });

    const updatedTeam = await Team.findById(team._id)
      .populate('captain', 'name email phone')
      .populate('members.user', 'name position skillLevel profileImage');

    res.json({
      success: true,
      message: 'You left the team successfully',
      data: updatedTeam,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is captain
    if (team.captain.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team captain can remove members' });
    }

    // Cannot remove captain
    if (userId === team.captain.toString()) {
      return res.status(400).json({ message: 'Cannot remove team captain' });
    }

    // Remove member
    team.members = team.members.filter(
      member => member.user.toString() !== userId
    );

    await team.save();

    // Update user's current team
    await User.findByIdAndUpdate(userId, { currentTeam: null });

    res.json({
      success: true,
      message: 'Member removed successfully',
      data: team
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private
exports.updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is captain
    if (team.captain.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team captain can update team' });
    }

    const updatedTeam = await Team.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('members.user', 'name position');

    res.json({
      success: true,
      data: updatedTeam
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private
exports.deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Check if user is captain
    if (team.captain.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only team captain can delete team' });
    }

    // Remove team reference from all members
    const memberIds = team.members.map(m => m.user);
    await User.updateMany(
      { _id: { $in: memberIds } },
      { currentTeam: null }
    );

    await Team.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Team deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

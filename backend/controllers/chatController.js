const Chat = require('../models/chat');
const Message = require('../models/message');
const User = require('../models/user');
const Team = require('../models/team');

const chatPopulate = [
  { path: 'members', select: 'name email position skillLevel profileImage currentTeam' },
  { path: 'admin', select: 'name email position profileImage' },
  { path: 'team', select: 'name' },
  { path: 'lastMessage.sender', select: 'name' },
];

const isChatMember = (chat, userId) => chat.members.some((member) => member.toString() === userId.toString());

exports.getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ members: req.user.id })
      .populate(chatPopulate)
      .sort('-updatedAt');

    res.json({
      success: true,
      count: chats.length,
      data: chats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createDirectChat = async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId || recipientId === req.user.id) {
      return res.status(400).json({ message: 'Please choose a valid recipient' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    const existingChat = await Chat.findOne({
      isGroupChat: false,
      members: { $all: [req.user.id, recipientId] },
    }).populate(chatPopulate);

    if (existingChat && existingChat.members.length === 2) {
      return res.json({ success: true, data: existingChat });
    }

    const chat = await Chat.create({
      name: '',
      isGroupChat: false,
      members: [req.user.id, recipientId],
    });

    const populatedChat = await Chat.findById(chat._id).populate(chatPopulate);

    res.status(201).json({
      success: true,
      data: populatedChat,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createGroupChat = async (req, res) => {
  try {
    const { name, memberIds } = req.body;

    if (!name || !Array.isArray(memberIds) || memberIds.length < 2) {
      return res.status(400).json({ message: 'Group name and at least two other members are required' });
    }

    const uniqueIds = [...new Set(memberIds.filter(Boolean))].filter((id) => id !== req.user.id);
    const users = await User.find({ _id: { $in: uniqueIds } });

    if (users.length !== uniqueIds.length) {
      return res.status(404).json({ message: 'One or more selected users were not found' });
    }

    const chat = await Chat.create({
      name: name.trim(),
      isGroupChat: true,
      admin: req.user.id,
      members: [req.user.id, ...uniqueIds],
    });

    const populatedChat = await Chat.findById(chat._id).populate(chatPopulate);

    res.status(201).json({
      success: true,
      data: populatedChat,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrCreateTeamChat = async (req, res) => {
  try {
    const team = await Team.findById(req.params.teamId).populate('members.user', '_id');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const isMember = team.members.some((member) => member.user?._id?.toString() === req.user.id);
    if (!isMember) {
      return res.status(403).json({ message: 'Only team members can open the team chat' });
    }

    let chat = await Chat.findOne({ team: team._id }).populate(chatPopulate);

    if (!chat) {
      const memberIds = team.members
        .map((member) => member.user?._id || member.user)
        .filter(Boolean)
        .map((id) => id.toString());

      chat = await Chat.create({
        name: `${team.name} Chat`,
        isGroupChat: true,
        admin: team.captain,
        team: team._id,
        members: memberIds,
      });

      chat = await Chat.findById(chat._id).populate(chatPopulate);
    }

    res.json({
      success: true,
      data: chat,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChatMessages = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!isChatMember(chat, req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to access this chat' });
    }

    const messages = await Message.find({ chat: chat._id })
      .populate('sender', 'name email profileImage')
      .sort('createdAt');

    res.json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const chat = await Chat.findById(req.params.id);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!isChatMember(chat, req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to send messages in this chat' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Message content is required' });
    }

    const message = await Message.create({
      chat: chat._id,
      sender: req.user.id,
      content: content.trim(),
    });

    chat.lastMessage = {
      content: content.trim(),
      sender: req.user.id,
      sentAt: new Date(),
    };
    await chat.save();

    const populatedMessage = await Message.findById(message._id).populate('sender', 'name email profileImage');

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only unsend your own messages' });
    }

    const chat = await Chat.findById(message.chat);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    if (!isChatMember(chat, req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to edit this chat' });
    }

    await Message.findByIdAndDelete(message._id);

    const latestMessage = await Message.findOne({ chat: chat._id }).sort('-createdAt');

    if (latestMessage) {
      chat.lastMessage = {
        content: latestMessage.content,
        sender: latestMessage.sender,
        sentAt: latestMessage.createdAt,
      };
    } else {
      chat.lastMessage = undefined;
    }

    await chat.save();

    res.json({
      success: true,
      message: 'Message unsent successfully',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

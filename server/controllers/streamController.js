import { streamRepository } from '../repositories/streamRepository.js';
import { streamService } from '../services/streamService.js';
import { emitToRoom } from '../config/socket.js';
import { sendSuccess, sendError, sendNoContent } from '../utils/responseHelper.js';

export const listStreams = async (req, res) => {
  const { page, limit, status } = req.query;
  const data = await streamRepository.listStreams({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 20,
    status,
  });
  sendSuccess(res, data);
};

export const getStream = async (req, res) => {
  const stream = await streamRepository.getStreamById(req.params.id);
  if (!stream) return sendError(req, res, 'Stream not found', 404, 'NOT_FOUND');

  // Update viewer count on access
  const count = await streamService.updateViewerMetrics(req.params.id);
  emitToRoom(`stream:${req.params.id}`, 'viewer_count_update', { count });

  sendSuccess(res, stream);
};

export const getStreamByEvent = async (req, res) => {
  const stream = await streamRepository.getStreamByEventId(req.params.eventId);
  sendSuccess(res, stream || { message: 'No stream for this event' });
};

export const createStream = async (req, res) => {
  const provision = await streamService.provisionLiveStream(req.body.title);
  const input = {
    ...req.body,
    stream_url: provision.serverUrl + '/' + provision.streamKey,
    hls_url: provision.playbackUrl,
  };
  const stream = await streamRepository.createStream(input);
  sendSuccess(res, { ...stream, streamKey: provision.streamKey }, 201);
};

export const updateStream = async (req, res) => {
  const stream = await streamRepository.updateStream(req.params.id, req.body);
  sendSuccess(res, stream);
};

export const setStreamStatus = async (req, res) => {
  const { status } = req.body;
  const stream = await streamRepository.setStreamStatus(req.params.id, status);
  emitToRoom(`stream:${req.params.id}`, 'status_change', { status });
  sendSuccess(res, stream);
};

export const deleteStream = async (req, res) => {
  await streamRepository.deleteStream(req.params.id);
  sendNoContent(res);
};

export const addChatMessage = async (req, res) => {
  const { message, user_name, user_email } = req.body;
  const filteredMessage = streamService.filterContent(message);

  const chat = await streamRepository.addChatMessage(req.params.id, {
    user_name,
    user_email,
    message: filteredMessage,
  });

  emitToRoom(`stream:${req.params.id}`, 'chat_message', chat);
  sendSuccess(res, chat, 201);
};

export const listChatMessages = async (req, res) => {
  const data = await streamRepository.listChatMessages(req.params.id);
  sendSuccess(res, data);
};

export const moderateChatMessage = async (req, res) => {
  const chat = await streamRepository.moderateChatMessage(req.params.messageId);
  if (chat) {
    emitToRoom(`stream:${chat.streamId}`, 'message_moderated', { id: chat.id });
  }
  sendSuccess(res, chat);
};

export const banUser = async (req, res) => {
  const { user_email } = req.body;
  await streamRepository.banUserFromStream(req.params.id, user_email);

  emitToRoom(`stream:${req.params.id}`, 'user_banned', { userEmail: user_email });
  sendSuccess(res, { message: `User ${user_email} banned` });
};

export const addModChatMessage = async (req, res) => {
  const chat = await streamRepository.addModChatMessage(req.params.id, req.body);
  emitToRoom(`stream:${req.params.id}:mods`, 'mod_chat_message', chat);
  sendSuccess(res, chat, 201);
};

export const listModChatMessages = async (req, res) => {
  const data = await streamRepository.listModChatMessages(req.params.id);
  sendSuccess(res, data);
};

export const getStreamAnalytics = async (req, res) => {
  const analytics = await streamRepository.getStreamAnalytics(req.params.id);
  if (!analytics) return sendError(req, res, 'Analytics not found', 404, 'NOT_FOUND');
  sendSuccess(res, analytics);
};

export const createPoll = async (req, res) => {
  const poll = await streamRepository.createPoll(req.params.id, req.body);
  emitToRoom(`stream:${req.params.id}`, 'new_poll', poll);
  sendSuccess(res, poll, 201);
};

export const listPolls = async (req, res) => {
  const polls = await streamRepository.listPolls(req.params.id);
  sendSuccess(res, polls);
};

export const votePoll = async (req, res) => {
  const poll = await streamRepository.votePoll(req.params.pollId, req.body.optionIndex);
  if (poll) {
    emitToRoom(`stream:${poll.streamId}`, 'poll_update', poll);
  }
  sendSuccess(res, poll);
};

export const closePoll = async (req, res) => {
  const poll = await streamRepository.closePoll(req.params.pollId);
  if (poll) {
    emitToRoom(`stream:${poll.streamId}`, 'poll_closed', { id: poll.id });
  }
  sendSuccess(res, poll);
};

export const adminListAll = async (req, res) => {
  const { page, limit, status } = req.query;
  const data = await streamRepository.adminListAll({ page, limit, status });
  sendSuccess(res, data);
};

// --- Q&A Handlers ---

export const addQuestion = async (req, res) => {
  const question = await streamRepository.addQuestion(req.params.id, req.body);
  emitToRoom(`stream:${req.params.id}`, 'new_question', question);
  sendSuccess(res, question, 201);
};

export const listQuestions = async (req, res) => {
  const questions = await streamRepository.listQuestions(req.params.id);
  sendSuccess(res, questions);
};

export const answerQuestion = async (req, res) => {
  const question = await streamRepository.answerQuestion(req.params.qId, req.body.answer);
  if (question) {
    emitToRoom(`stream:${question.streamId}`, 'question_answered', question);
  }
  sendSuccess(res, question);
};

// --- Reaction Handlers ---

export const addReaction = async (req, res) => {
  const reaction = await streamRepository.addReaction(req.params.id, req.body.emoji);
  emitToRoom(`stream:${req.params.id}`, 'reaction', {
    emoji: req.body.emoji,
    count: reaction.count,
  });
  sendSuccess(res, reaction);
};

export const getReactions = async (req, res) => {
  const reactions = await streamRepository.getReactions(req.params.id);
  sendSuccess(res, reactions);
};

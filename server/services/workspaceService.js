/**
 * Workspace Service
 * Mock implementation for Smart Workspace for Club & Team Collaboration
 */

const workspaces = [
  {
    id: 1,
    name: "Coding Club Workspace",
    description: "Workspace for Coding Club members",
    createdAt: new Date().toISOString(),
  },
];

const documents = [];
const discussions = [];
const tasks = [];
const meetingNotes = [];
const polls = [];
const announcements = [];
const bookmarks = [];
const timeline = [];

// Get All Workspaces
const getAllWorkspaces = async () => workspaces;

// Get Workspace By ID
const getWorkspaceById = async (id) =>
  workspaces.find((workspace) => workspace.id === Number(id));

// Create Workspace
const createWorkspace = async (data) => {
  const workspace = {
    id: workspaces.length + 1,
    createdAt: new Date().toISOString(),
    ...data,
  };

  workspaces.push(workspace);
  return workspace;
};

// Update Workspace
const updateWorkspace = async (id, data) => {
  const index = workspaces.findIndex(
    (workspace) => workspace.id === Number(id)
  );

  if (index === -1) return null;

  workspaces[index] = {
    ...workspaces[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  return workspaces[index];
};

// Delete Workspace
const deleteWorkspace = async (id) => {
  const index = workspaces.findIndex(
    (workspace) => workspace.id === Number(id)
  );

  if (index === -1) return null;

  return workspaces.splice(index, 1)[0];
};

// Documents
const getDocuments = async () => documents;

const uploadDocument = async (workspaceId, data) => {
  const document = {
    id: documents.length + 1,
    workspaceId: Number(workspaceId),
    uploadedAt: new Date().toISOString(),
    ...data,
  };

  documents.push(document);
  return document;
};

// Discussions
const getDiscussions = async () => discussions;

const addDiscussion = async (workspaceId, data) => {
  const discussion = {
    id: discussions.length + 1,
    workspaceId: Number(workspaceId),
    createdAt: new Date().toISOString(),
    ...data,
  };

  discussions.push(discussion);
  return discussion;
};

// Calendar
const getCalendar = async (workspaceId) => ({
  workspaceId: Number(workspaceId),
  events: [
    {
      title: "Weekly Team Meeting",
      date: "2026-07-15",
    },
  ],
});

// Tasks
const createTask = async (workspaceId, data) => {
  const task = {
    id: tasks.length + 1,
    workspaceId: Number(workspaceId),
    status: "Pending",
    createdAt: new Date().toISOString(),
    ...data,
  };

  tasks.push(task);
  return task;
};

const getTasks = async () => tasks;

// Meeting Notes
const addMeetingNotes = async (workspaceId, data) => {
  const notes = {
    id: meetingNotes.length + 1,
    workspaceId: Number(workspaceId),
    createdAt: new Date().toISOString(),
    ...data,
  };

  meetingNotes.push(notes);
  return notes;
};

// Polls
const createPoll = async (workspaceId, data) => {
  const poll = {
    id: polls.length + 1,
    workspaceId: Number(workspaceId),
    createdAt: new Date().toISOString(),
    ...data,
  };

  polls.push(poll);
  return poll;
};

// Announcements
const createAnnouncement = async (workspaceId, data) => {
  const announcement = {
    id: announcements.length + 1,
    workspaceId: Number(workspaceId),
    createdAt: new Date().toISOString(),
    ...data,
  };

  announcements.push(announcement);
  return announcement;
};

// Timeline
const getTimeline = async () => timeline;

// Bookmarks
const getBookmarks = async () => bookmarks;

// Analytics
const getAnalytics = async (workspaceId) => ({
  workspaceId: Number(workspaceId),
  members: 25,
  documents: documents.length,
  discussions: discussions.length,
  tasks: tasks.length,
  polls: polls.length,
  announcements: announcements.length,
});

module.exports = {
  getAllWorkspaces,
  getWorkspaceById,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  getDocuments,
  uploadDocument,
  getDiscussions,
  addDiscussion,
  getCalendar,
  createTask,
  getTasks,
  addMeetingNotes,
  createPoll,
  createAnnouncement,
  getTimeline,
  getBookmarks,
  getAnalytics,
};
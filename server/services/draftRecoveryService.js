const drafts = [];

class DraftRecoveryService {
  createDraft(userId, module, title, content) {
    const draft = {
      id: Date.now().toString(),
      userId,
      module,
      title,
      content,
      autoSaved: true,
      offline: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      versions: [
        {
          version: 1,
          content,
          savedAt: new Date(),
        },
      ],
    };

    drafts.push(draft);

    return draft;
  }

  getDraft(id) {
    return drafts.find((draft) => draft.id === id);
  }

  listDrafts(userId) {
    return drafts.filter((draft) => draft.userId === userId);
  }

  updateDraft(id, content) {
    const draft = this.getDraft(id);

    if (!draft) return null;

    draft.content = content;
    draft.updatedAt = new Date();

    draft.versions.push({
      version: draft.versions.length + 1,
      content,
      savedAt: new Date(),
    });

    return draft;
  }

  deleteDraft(id) {
    const index = drafts.findIndex((draft) => draft.id === id);

    if (index === -1) return false;

    drafts.splice(index, 1);

    return true;
  }

  restoreDraft(id) {
    const draft = this.getDraft(id);

    if (!draft) return null;

    return draft.versions[draft.versions.length - 1];
  }

  versionHistory(id) {
    const draft = this.getDraft(id);

    return draft ? draft.versions : [];
  }

  syncDraft(id) {
    const draft = this.getDraft(id);

    if (!draft) return null;

    draft.offline = false;
    draft.updatedAt = new Date();

    return draft;
  }

  expireDrafts() {
    const now = new Date();

    for (let i = drafts.length - 1; i >= 0; i--) {
      if (drafts[i].expiresAt < now) {
        drafts.splice(i, 1);
      }
    }

    return true;
  }

  getStatistics() {
    return {
      totalDrafts: drafts.length,
      autoSaved: drafts.filter((d) => d.autoSaved).length,
      offlineDrafts: drafts.filter((d) => d.offline).length,
      activeUsers: [...new Set(drafts.map((d) => d.userId))].length,
    };
  }
}

module.exports = new DraftRecoveryService();
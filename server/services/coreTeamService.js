import { supabaseRequest, HAS_SUPABASE } from '../storage/supabaseClient.js';
import { readContent, writeContent } from '../storage/contentFileStore.js';
import { sanitizeCoreTeamMemberRecord } from '../utils/sanitize.js';
import crypto from 'crypto';
import { coreTeamMemberSchema, normalizeCoreTeamGate } from '../schemas/coreTeamMemberSchema.js';
import { UnauthorizedError } from '../utils/errors.js';

function normalizePhone(value) {
  return String(value || '').replace(/[^\d]/g, '');
}

export const coreTeamService = {
  async listMembers() {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest('core_team_members?select=*&order=created_at.asc');
      return rows.map((row) =>
        sanitizeCoreTeamMemberRecord({
          id: row.id,
          name: row.name,
          role: row.role,
          year: row.year,
          branch: row.branch,
          section: row.section,
          email: row.email,
          whatsapp: row.whatsapp,
          linkedin: row.linkedin,
          instagram: row.instagram,
          photoUrl: row.photo_url,
          createdAt: row.created_at,
        })
      );
    }

    const content = await readContent();
    return (content.coreTeam || []).map((member) => sanitizeCoreTeamMemberRecord(member));
  },

  async addMember(input) {
    const member = coreTeamMemberSchema.parse(input);

    if (HAS_SUPABASE) {
      const [row] = await supabaseRequest('core_team_members', {
        method: 'POST',
        body: [
          {
            name: member.name,
            role: member.role,
            year: member.year,
            branch: member.branch,
            section: member.section,
            email: member.email,
            whatsapp: member.whatsapp,
            linkedin: member.linkedin,
            instagram: member.instagram,
            photo_url: member.photoUrl,
          },
        ],
      });

      const res = sanitizeCoreTeamMemberRecord({
        id: row.id,
        name: row.name,
        role: row.role,
        year: row.year,
        branch: row.branch,
        section: row.section,
        email: row.email,
        whatsapp: row.whatsapp,
        linkedin: row.linkedin,
        instagram: row.instagram,
        photoUrl: row.photo_url,
        createdAt: row.created_at,
      });
      import('../services/searchIndexer.js')
        .then(({ searchIndexer }) => searchIndexer.indexMember(res))
        .catch(() => {});
      return res;
    }

    const content = await readContent();
    content.coreTeam = content.coreTeam || [];
    const createdAt = new Date().toISOString();
    const newMember = { ...member, id: crypto.randomUUID(), createdAt };
    content.coreTeam.push(newMember);
    await writeContent(content);
    const res = sanitizeCoreTeamMemberRecord(newMember);
    import('../services/searchIndexer.js')
      .then(({ searchIndexer }) => searchIndexer.indexMember(res))
      .catch(() => {});
    return res;
  },

  async updateMember(id, input) {
    const member = coreTeamMemberSchema.parse(input);

    if (HAS_SUPABASE) {
      const [row] = await supabaseRequest(`core_team_members?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: {
          name: member.name,
          role: member.role,
          year: member.year,
          branch: member.branch,
          section: member.section,
          email: member.email,
          whatsapp: member.whatsapp,
          linkedin: member.linkedin ?? null,
          instagram: member.instagram ?? null,
          photo_url: member.photoUrl ?? null,
        },
      });

      const res = sanitizeCoreTeamMemberRecord({
        id: row.id,
        name: row.name,
        role: row.role,
        year: row.year,
        branch: row.branch,
        section: row.section,
        email: row.email,
        whatsapp: row.whatsapp,
        linkedin: row.linkedin,
        instagram: row.instagram,
        photoUrl: row.photo_url,
        createdAt: row.created_at,
      });
      import('../services/searchIndexer.js')
        .then(({ searchIndexer }) => searchIndexer.indexMember(res))
        .catch(() => {});
      return res;
    }

    const content = await readContent();
    content.coreTeam = content.coreTeam || [];
    const index = content.coreTeam.findIndex((m) => String(m.id) === String(id));
    if (index === -1) return null;

    const updated = { ...content.coreTeam[index], ...member, id: content.coreTeam[index].id };
    content.coreTeam[index] = updated;
    await writeContent(content);
    const res = sanitizeCoreTeamMemberRecord(updated);
    import('../services/searchIndexer.js')
      .then(({ searchIndexer }) => searchIndexer.indexMember(res))
      .catch(() => {});
    return res;
  },

  async deleteMember(id) {
    if (HAS_SUPABASE) {
      const rows = await supabaseRequest(`core_team_members?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const success = Array.isArray(rows) && rows.length > 0;
      if (success) {
        import('../services/searchIndexer.js')
          .then(({ searchIndexer }) => searchIndexer.deleteDocument('members', id))
          .catch(() => {});
      }
      return success;
    }

    const content = await readContent();
    content.coreTeam = content.coreTeam || [];
    const before = content.coreTeam.length;
    content.coreTeam = content.coreTeam.filter((member) => String(member.id) !== String(id));
    if (content.coreTeam.length === before) return false;
    await writeContent(content);
    import('../services/searchIndexer.js')
      .then(({ searchIndexer }) => searchIndexer.deleteDocument('members', id))
      .catch(() => {});
    return true;
  },

  async assertCanManageActivityEvent(body) {
    const gate = normalizeCoreTeamGate(body);
    const expectedPassword = process.env.ADMIN_EVENT_PASSWORD;

    if (!expectedPassword) {
      throw new Error('ADMIN_EVENT_PASSWORD is not configured');
    }
    if (gate.password !== expectedPassword) {
      throw new UnauthorizedError('Unauthorized. Core team details or password did not match.');
    }

    const name = String(gate.name || '')
      .trim()
      .toLowerCase();
    const email = String(gate.email || '')
      .trim()
      .toLowerCase();
    const phone = normalizePhone(gate.phone);

    const members = await this.listMembers();
    const allowed = members.some(
      (member) =>
        String(member.name || '')
          .trim()
          .toLowerCase() === name &&
        String(member.email || '')
          .trim()
          .toLowerCase() === email &&
        normalizePhone(member.whatsapp) === phone
    );
    if (!allowed) {
      throw new UnauthorizedError('Unauthorized. Core team details or password did not match.');
    }
    return true;
  },
};

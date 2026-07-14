import {
  getReadOnlyStatus as getStatus,
  activateReadOnlyMode as activateMode,
  deactivateReadOnlyMode as deactivateMode,
  logIncident,
} from '../services/readOnlyService.js';

export const getReadOnlyStatus = () => getStatus();

export const activateReadOnlyMode = (reason) => activateMode(reason);

export const deactivateReadOnlyMode = () => deactivateMode();

export const createIncidentLog = (incident) =>
  logIncident(
    incident || { severity: 'info', message: 'Read-only mode check', createdBy: 'system' }
  );

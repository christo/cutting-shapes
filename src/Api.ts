/**
 * Client-server API constants, shared by both.
 */
export const SERVER_HTTP_PORT = 3001;

export const API_PREFIX = '/api';

export const ENDPOINTS = {
  RECORDINGS: `${API_PREFIX}/recordings`,
} as const;

/**
 * Query param for recording start time, epoch ms.
 */
export const PARAM_RECORDING_START = 'start';

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  PARTIAL_CONTENT: 206,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  LENGTH_REQUIRED: 411,
  PAYLOAD_TOO_LARGE: 413,
  INTERNAL_SERVER_ERROR: 500,
} as const;

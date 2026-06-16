const DEFAULT_API_URL = 'http://localhost:5000/api/todos';

/** VITE_API_URL(.../todos)에서 API 루트(.../api) 추출 */
function getApiRoot() {
  const url = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
  return url.replace(/\/todos\/?$/, '');
}

const API_ROOT = getApiRoot();

export function getApiBaseUrl() {
  return API_ROOT;
}

export async function apiFetch(resource, path = '', options = {}) {
  const res = await fetch(`${API_ROOT}/${resource}${path}`, {
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
      ...options.headers,
    },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 502 || res.status === 503) {
      throw new Error(
        '백엔드 서버에 연결할 수 없습니다. Heroku 앱이 실행 중인지 확인해주세요.'
      );
    }
    throw new Error(data.error || '요청에 실패했습니다.');
  }
  return data;
}

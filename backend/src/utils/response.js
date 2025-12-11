export function ok(data) {
  return { success: true, data, error: null };
}

export function fail(message, status = 400) {
  return { success: false, data: null, error: message, status };
}

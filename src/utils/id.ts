export const createId = (prefix: string) =>
    typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${prefix}-${Math.random().toString(36).slice(2, 9)}`;

export function findSameValueMap(
  base: Record<string, string>,
  target: Record<string, string>
): Record<string, string> {
  const res: Record<string, string> = {};

  Object.entries(base).forEach(([key, value]) => {
    if (target[key] === value) {
      res[key] = value;
    }
  });

  return res;
}

export function mergeObject(
  base: Record<string, string>,
  obj: Record<string, string>
) {
  const res = { ...base };

  Object.entries(obj).forEach(([key, value]) => {
    res[key] = value;
  });

  return res;
}

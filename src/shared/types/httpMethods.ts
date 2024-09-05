const HTTP_METHODS = {
  GET: "get",
  POST: "post",
  PUT: "put",
  DELETE: "delete",
} as const;

type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS];

export { HTTP_METHODS };
export type { HttpMethod };

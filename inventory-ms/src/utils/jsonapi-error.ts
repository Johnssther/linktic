export function jsonApiError(
    status: number,
    title: string,
    detail: string
  ) {
    return {
      errors: [
        {
          status: status.toString(),
          title,
          detail,
        },
      ],
    };
  }
  
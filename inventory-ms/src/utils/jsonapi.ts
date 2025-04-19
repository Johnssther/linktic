export function jsonApiResponse(type: string, data: any | any[]) {
    if (Array.isArray(data)) {
      return {
        data: data.map((item) => ({
          type,
          id: String(item.id),
          attributes: { ...item, id: undefined }, // evita repetir el ID en attributes
        })),
      };
    }
  
    return {
      data: {
        type,
        id: String(data.id),
        attributes: { ...data, id: undefined },
      },
    };
  }
  
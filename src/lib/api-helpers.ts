export const parseRequestBody = async (req: Request) => {
  try {
    return await req.json();
  } catch {
    return null;
  }
};

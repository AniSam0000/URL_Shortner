import { nanoid } from "nanoid";

export const generateShortCode = () => {
  return nanoid(6); // Generate a 6-character short code
};

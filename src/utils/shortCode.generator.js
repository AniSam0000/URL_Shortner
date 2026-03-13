import { nanoid } from "nanoid";

export const generateShortCode = () => {
  return nanoid(10); // Generate an 8-character short code
};

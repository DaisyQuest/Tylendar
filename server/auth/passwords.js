const crypto = require("crypto");

const HASH_KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function hashPassword(password, salt = crypto.randomBytes(SALT_LENGTH).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, HASH_KEY_LENGTH).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  if (typeof storedHash !== "string") {
    return false;
  }
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) {
    return false;
  }
  const candidate = crypto.scryptSync(password, salt, HASH_KEY_LENGTH).toString("hex");
  const hashBuffer = Buffer.from(hash, "hex");
  const candidateBuffer = Buffer.from(candidate, "hex");
  if (hashBuffer.length !== candidateBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(hashBuffer, candidateBuffer);
}

module.exports = {
  hashPassword,
  verifyPassword
};

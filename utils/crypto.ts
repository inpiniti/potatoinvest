import CryptoJS from "crypto-js";

// 복호화 메서드
export const decrypt = (key: string, value: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(value, key);
    const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedValue) {
      throw new Error("Decryption failed");
    }
    return decryptedValue;
  } catch (error) {
    console.error("Decryption error:", error);
    throw error;
  }
};

// 암호화 메서드
export const encrypt = (key: string, value: string): string => {
  return CryptoJS.AES.encrypt(value, key).toString();
};

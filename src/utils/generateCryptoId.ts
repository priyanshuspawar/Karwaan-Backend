import crypto from 'crypto'

export const generateCryptoId = () => {
    return crypto.randomBytes(24).toString('hex');
}
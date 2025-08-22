import bcrypt from 'bcryptjs'

export async function hashPassword(plain: string) {
  const saltRounds = Number(process.env.BCRYPT_COST || 12)
  const salt = await bcrypt.genSalt(saltRounds)
  return bcrypt.hash(plain, salt)
}

export async function verifyPassword(plain: string, hashed: string) {
  return bcrypt.compare(plain, hashed)
}



import bcrypt from 'bcrypt';

async function saltAndHashPassword(password: string): Promise<string> {
	const saltRounds = 10;
	const salt = await bcrypt.genSalt(saltRounds);
	const hashedPassword = await bcrypt.hash(password, salt);
	return hashedPassword;
}

async function comparePasswords(plainText: string, hashed: string): Promise<boolean> {
	return bcrypt.compare(plainText, hashed);
}

export { saltAndHashPassword, comparePasswords };
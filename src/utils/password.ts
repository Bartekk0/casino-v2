// import bcrypt from 'bcrypt';

async function saltAndHashPassword(password: string): Promise<string> {
	// const saltRounds = 10; // Number of iterations to make brute force harder
	// const salt = await bcrypt.genSalt(saltRounds);
	// const hashedPassword = await bcrypt.hash(password, salt);
	// return hashedPassword;
	return password;
}

export { saltAndHashPassword };

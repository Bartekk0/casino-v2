import { error } from '@sveltejs/kit';

export async function load({ locals }) {
	try {
		const session = await locals.getSession();
		return { session };
	} catch (err) {
		throw error(500, 'Server error');
	}
}

import { auth } from '../../lib/server/auth';
import type { Actions } from './$types';
export const actions: Actions = { default: auth.signOut };
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	const session = await locals.getSession();
	if (!session) {
		throw redirect(302, '/');
	}
	return { session };
}

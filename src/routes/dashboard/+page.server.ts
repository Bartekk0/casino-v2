import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	redirect(302, '/');
}

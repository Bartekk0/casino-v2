import { error } from "console";

export async function load({ locals }) {
  try {
    const session = await locals.getSession();
    console.log('SESSION:', session);
    return { session };
  } catch (err) {
    console.error('LOAD ERROR:', err);
    throw error(500, 'Server error');
  }
}
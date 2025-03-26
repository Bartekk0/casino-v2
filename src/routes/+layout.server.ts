import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	// console.log(event.locals);

	// const session = await event.locals.auth();
	// NIE DZIAŁA
	return {
		// session
	};
};

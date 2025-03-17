// import lodash
import { isEmpty } from 'lodash';

export const showSnackbar = (text, options) => {
	if ( isEmpty(text) ) return;

	const {
		style = 'info',
		isDismissible = true,
		icon = null,
	} = options;

	wp.data.dispatch("core/notices").createNotice(
		style,
		text,
		{
			type: "snackbar",
			isDismissible: isDismissible,
			icon: icon,
		}
	);
};
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
// export const getTestId = (componentName: string, id?: string) => {
// 	return `${componentName}${id ? `-${id}` : ''}`;
// };

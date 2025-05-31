import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const dtl = {
	theme: {
		colors: {
			current: 'currentColor',
			transparent: 'transparent',
			neutralbkg1: '#FFFFFF',
			neutralbkg2: '#FAFAFA',
			neutralbkg3: '#F5F5F5',
			neutralstroke2: '#EAEAEA',
			neutralstroke1: '#DADADA',
			disabled: '#CACACA',
			neutral3: '#6C6E6F',
			neutral2: '#48494A',
			neutral1: '#212121',
			inverted: '#FFFFFF',
			primary: {
				25: '#F4F8FF',
				100: '#DAE7FE',
				200: '#C9DDFE',
				500: '#065FF5',
				700: '#044CC4',
				900: '#032C71',
				950: '#021C4A',
			},
			error: {
				25: '#FEF3F3',
				100: '#FEE4E2',
				200: '#FFCDCA',
				500: '#DA2D20',
				700: '#B42318',
				900: '#912018',
				950: '#55110C',
			},
			warning: {
				25: '#FFFAEB',
				100: '#FEF0C7',
				200: '#FEDF89',
				500: '#DC6803',
				700: '#B54708',
				900: '#93370E',
				950: '#452101',
			},
			success: {
				25: '#ECFDF3',
				100: '#D1FADF',
				200: '#A6F4C5',
				500: '#039855',
				700: '#027A48',
				900: '#05603A',
				950: '#01341D',
			},
			blue: '#2373FA',
			cream: '#FAFAF5',
			black: '#191919',
			green: '#50A36C',
			brown: '#C48458',
			gray: '#829BA0',
			red: '#BC5A41',
			pink: '#FABCB1',
			yellow: '#D0E646',
			psa: {
				blue: '#0050A2',
				red: '#EB1C2D',
				gray: '#9BA0AA',
			},
		},
		fontFamily: {
			sans: ['"Area Normal"', 'Verdana', 'Helvetica', 'sans-serif'],
		},
		fontWeight: {
			normal: 400, //bold in Area Normal, but usage + fall back font Verdana matches better these weights (less fout)
			semibold: 500, //extrabold in Area Normal
			bold: 600, //black in Area Normal
		},
		boxShadow: {
			elevation1: '0px 1px 4px 0px rgba(0,0,0,0.08)', //navigation bar
			elevation2: '0px 12px 16px 0px rgba(0,0,0,0.08)', //menus
			elevation3: '0px 4px 40px 0px rgba(0,0,0,0.2)', //modals, toasts
			none: '0 0 #0000',
		},
		extend: {
			borderRadius: {
				'4xl': '2.0rem',
			},
			fontSize: {
				display1: [
					'5rem',
					{
						lineHeight: '5.5rem',
						letterSpacing: '-.01em',
						fontWeight: 500,
					},
				], //80/88
				display2: [
					'4rem',
					{
						lineHeight: '5rem',
						letterSpacing: '-.01em',
						fontWeight: 500,
					},
				], //64/80
				display3: [
					'3.25rem',
					{
						lineHeight: '3.75rem',
						letterSpacing: '-.02em',
						fontWeight: 500,
					},
				], //52/60
				display4: [
					'2.5rem',
					{
						lineHeight: '3.25rem',
						letterSpacing: '-.02em',
						fontWeight: 500,
					},
				], //40/52
				display5: [
					'1.5rem',
					{
						lineHeight: '2rem',
						fontWeight: 500,
					},
				], //24/32
				subtitle1: [
					'1.1875rem',
					{
						lineHeight: '1.75rem',
						letterSpacing: '.01em',
						fontWeight: 500,
					},
				], //19/28
				subtitle2: [
					'1.0625rem',
					{
						lineHeight: '1.5rem',
						letterSpacing: '.01em',
						fontWeight: 500,
					},
				], //17/24
				body1: [
					'0.9375rem',
					{
						lineHeight: '1.5rem',
						letterSpacing: '.01em',
					},
				], //15/24
				body2: [
					'0.8125rem',
					{
						lineHeight: '1.25rem',
						letterSpacing: '.01em',
					},
				], //13/20
				caption1: [
					'0.6875rem',
					{
						lineHeight: '1rem',
						letterSpacing: '.02em',
						fontWeight: 500,
					},
				], //11/16
				caption2: [
					'0.625rem',
					{
						lineHeight: '1rem',
						letterSpacing: '.02em',
						fontWeight: 500,
					},
				], //10/16
				caption3: [
					'0.5625rem',
					{
						lineHeight: '0.6875rem',
						letterSpacing: '.03em',
						fontWeight: 600,
					},
				], //9/11
			},
			screens: {
				xxs: '400px',
				xs: '480px',
			},
			spacing: {
				'15': '3.75rem', //banners (ie. 60px based on 16px base using Tailwind height math)
			},
		},
	},
};

const customTwMerge = extendTailwindMerge({
	theme: dtl.theme,
	classGroups: {
		'font-size': [
			{
				text: Object.keys(dtl.theme.extend.fontSize),
			},
		],
	},
});

export function cn(...inputs: ClassValue[]) {
	return customTwMerge(clsx(inputs));
}

export const getTestId = (componentName: string, id?: string) => {
	return `${componentName}${id ? `-${id}` : ''}`;
};

'use client'

import { useState } from 'react'
import type { ComponentProps } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Transform {
	x: number;
	y: number;
	rotationZ: number;
}

const transforms: Transform[] = [
	{ x: -0.8, y: -0.6, rotationZ: -29 },
	{ x: -0.2, y: -0.4, rotationZ: -6 },
	{ x: -0.05, y: 0.1, rotationZ: 12 },
	{ x: -0.05, y: -0.1, rotationZ: -9 },
	{ x: -0.1, y: 0.55, rotationZ: 3 },
	{ x: 0, y: -0.1, rotationZ: 9 },
	{ x: 0, y: 0.15, rotationZ: -12 },
	{ x: 0, y: 0.15, rotationZ: -17 },
	{ x: 0, y: -0.65, rotationZ: 9 },
	{ x: 0.1, y: 0.4, rotationZ: 12 },
	{ x: 0, y: -0.15, rotationZ: -9 },
	{ x: 0.2, y: 0.15, rotationZ: 12 },
	{ x: 0.8, y: 0.6, rotationZ: 20 },
]

type TextDisperseProps = ComponentProps<'span'> & {
	children: string;
	dispersed?: boolean;
	onHover?: (isActive: boolean) => void;
};

export function TextDisperse({
	children,
	dispersed,
	onHover,
	className,
	...props
}: Omit<TextDisperseProps, 'onMouseEnter' | 'onMouseLeave'>) {
	const [isAnimated, setIsAnimated] = useState(false)
	const isDispersed = dispersed ?? isAnimated

	const splitText = (text: string) => {
		let characterIndex = 0

		return text.split(/(\s+)/).map((token, tokenIndex) => {
			if (/^\s+$/.test(token)) {
				return (
					<span aria-hidden="true" className="inline-block min-w-[0.32em]" key={`space-${tokenIndex}`}>
						{'\u00A0'}
					</span>
				)
			}

			return (
				<span aria-hidden="true" className="inline-flex whitespace-nowrap" key={`word-${token}-${tokenIndex}`}>
					{token.split('').map((char) => {
						const currentIndex = characterIndex
						const transform = transforms[currentIndex % transforms.length]
						characterIndex += 1

						return (
							<motion.span
								className="inline-block"
								custom={currentIndex}
								variants={{
									open: () => ({
										x: `${transform.x}em`,
										y: `${transform.y}em`,
										rotateZ: transform.rotationZ,
										transition: { duration: 0.75, ease: [0.33, 1, 0.68, 1] },
										zIndex: 1,
									}),
									closed: {
										x: 0,
										y: 0,
										rotateZ: 0,
										transition: { duration: 0.75, ease: [0.33, 1, 0.68, 1] },
										zIndex: 0,
									},
								}}
								animate={isDispersed ? 'open' : 'closed'}
								key={`${char}-${currentIndex}`}
							>
								{char}
							</motion.span>
						)
					})}
				</span>
			)
		})
	}

	const manageMouseEnter = () => {
		onHover?.(true)
		setIsAnimated(true)
	}

	const manageMouseLeave = () => {
		onHover?.(false)
		setIsAnimated(false)
	}

	return (
		<span
			aria-label={children}
			className={cn(
				'relative inline-flex flex-wrap items-baseline leading-relaxed',
				className,
			)}
			onMouseEnter={manageMouseEnter}
			onMouseLeave={manageMouseLeave}
			{...props}
		>
			{splitText(children)}
		</span>
	)
}

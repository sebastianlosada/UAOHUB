import React, { useRef, useEffect, useCallback, useMemo } from 'react';

const ClickOutHandler = ({
	children,
	enabled = true,
	events = ['mousedown', 'touchstart'],
	ignoredElements = [],
	refProp = 'ref',
	wrapWith = null,
	onClickOut
}) => {
	const wrapperRef = useRef(null);

	const isWrapper = useCallback(
		(target) => wrapperRef.current && wrapperRef.current.contains(target),
		[]
	);

	const isIgnored = useCallback(
		(target) =>
			ignoredElements.some((element) => element.current && element.current.contains(target)),
		[ignoredElements]
	);

	const handleEvent = useCallback(
		(event) => {
			if (!enabled) {
				return;
			}

			const target = event.target;

			if (!isWrapper(target) && !isIgnored(target)) {
				onClickOut(event);
			}
		},
		[enabled, isWrapper, isIgnored, onClickOut]
	);

	useEffect(() => {
		const handle = (event) => handleEvent(event);

		events.forEach((event) => {
			document.addEventListener(event, handle);
		});

		return () => {
			events.forEach((event) => {
				document.removeEventListener(event, handle);
			});
		};
	}, [enabled, events, handleEvent]);

	const childProps = useMemo(
		() => ({
			[refProp]: wrapperRef
		}),
		[refProp]
	);

	const renderWrappedElement = useCallback(() => {
		if (wrapWith) {
			const Wrapper = wrapWith;
			return <Wrapper {...childProps}>{children}</Wrapper>;
		}

		if (React.Children.count(children) === 1) {
			const child = React.Children.only(children);
			return React.cloneElement(child, childProps);
		}

		return <div {...childProps}>{children}</div>;
	}, [wrapWith, children, childProps]);

	return renderWrappedElement();
};

export default ClickOutHandler;

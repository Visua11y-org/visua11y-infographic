import { addFilter } from '@wordpress/hooks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';
import { TextControl, PanelBody } from '@wordpress/components';
import { Fragment } from '@wordpress/element';

// 1️⃣ Add custom attribute to the core/image block
const addAriaDescribedbyAttribute = (settings, name) => {
	if (name !== 'core/image') {
		return settings;
	}

	return {
		...settings,
		attributes: {
			...settings.attributes,
			ariaDescribedby: {
				type: 'string',
				default: '',
			},
		},
	};
};

addFilter(
	'blocks.registerBlockType',
	'custom/image-aria-describedby',
	addAriaDescribedbyAttribute
);

// 2️⃣ Add control to the sidebar
const withAriaDescribedbyControl = createHigherOrderComponent((BlockEdit) => {
	return (props) => {
		if (props.name !== 'core/image') {
			return <BlockEdit {...props} />;
		}

		const { attributes, setAttributes } = props;
		const { ariaDescribedby } = attributes;

		return (
			<Fragment>
				<BlockEdit {...props} />
				<InspectorControls>
					<PanelBody title="Accessibility">
						<TextControl
							label="Aria Describedby"
							value={ariaDescribedby}
							onChange={(value) => setAttributes({ ariaDescribedby: value })}
							help="Enter the ID of the element describing this image."
						/>
					</PanelBody>
				</InspectorControls>
			</Fragment>
		);
	};
}, 'withAriaDescribedbyControl');

addFilter(
	'editor.BlockEdit',
	'custom/image-aria-describedby-sidebar',
	withAriaDescribedbyControl
);

// 3️⃣ Modify the editor preview (editor only)
const applyAriaDescribedbyToEditor = (element, blockType, attributes) => {
	if (blockType.name !== 'core/image' || !attributes.ariaDescribedby) {
		return element;
	}

	if (element.type === 'figure' && element.props.children) {
		const children = Array.isArray(element.props.children)
			? element.props.children
			: [element.props.children];

		return {
			...element,
			props: {
				...element.props,
				children: children.map((child) => {
					if (child?.type === 'img') {
						return {
							...child,
							props: {
								...child.props,
								'aria-describedby': attributes.ariaDescribedby,
							},
						};
					}
					return child;
				}),
			},
		};
	}

	return element;
};

addFilter(
	'blocks.getSaveElement',
	'custom/image-aria-describedby-editor',
	applyAriaDescribedbyToEditor
);

// 4️⃣ Modify the saved HTML (frontend)
const applyAriaDescribedbyToSave = (element, blockType, attributes) => {
	if (blockType.name === 'core/image' && attributes.ariaDescribedby) {
		if (element && element.props && element.type === 'figure' && element.props.children) {
			const children = Array.isArray(element.props.children)
				? element.props.children
				: [element.props.children];

			return {
				...element,
				props: {
					...element.props,
					children: children.map((child) => {
						if (child && child.props && child.props.children) {
							// Check if the inner children contain the img element.
							const innerChildren = Array.isArray(child.props.children) ? child.props.children : [child.props.children];
							const updatedInnerChildren = innerChildren.map(innerChild => {
								if (innerChild && innerChild.type === 'img') {
									return {
										...innerChild,
										props: {
											...innerChild.props,
											'aria-describedby': attributes.ariaDescribedby,
										},
									};
								}
								return innerChild;
							});
							return {
								...child,
								props: {
									...child.props,
									children: updatedInnerChildren,
								},
							};
						}
						return child;
					}),
				},
			};
		}
	}
	return element;
};

addFilter(
	'blocks.getSaveElement',
	'custom/image-aria-describedby-save',
	applyAriaDescribedbyToSave
);

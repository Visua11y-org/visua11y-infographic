import { __, _n } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import { InspectorControls } from '@wordpress/block-editor';
import { createHigherOrderComponent } from '@wordpress/compose';
import { PanelBody, FormTokenField, Button } from '@wordpress/components';
import { Fragment, useState } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';

// 1️⃣ Add custom attribute to the core/image block
const addAriaDescribedbyAttribute = ( settings, name ) => {
	if ( name !== 'core/image' ) {
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
const withAriaDescribedbyControl = createHigherOrderComponent(
	( BlockEdit ) => {
		return ( props ) => {
			if ( props.name !== 'core/image' ) {
				return <BlockEdit { ...props } />;
			}

			const { attributes, setAttributes } = props;
			const { ariaDescribedby } = attributes;
			const [ tokens, setTokens ] = useState(
				ariaDescribedby ? ariaDescribedby.split( ' ' ) : []
			);
			const [ isEditing, setIsEditing ] = useState( ! ariaDescribedby ); // Show input if empty
			const { selectBlock } = useDispatch( 'core/block-editor' );

			// Get all blocks and extract their "anchor" attributes using useSelect
			const allAnchors = useSelect( ( select ) => {
				const blocks = select( 'core/block-editor' ).getBlocks();
				return blocks
					.map( ( block ) => ( {
						anchor: block.attributes?.anchor,
						id: block.clientId,
					} ) )
					.filter( ( item ) => item.anchor ); // Remove empty anchors
			}, [] );

			const handleSave = () => {
				setAttributes( { ariaDescribedby: tokens.join( ' ' ) } );
				setIsEditing( false );
			};

			const handleAnchorClick = ( anchor ) => {
				// Select the block with the matching anchor using useSelect
				const blockToSelect = allAnchors.find(
					( block ) => block.anchor === anchor
				);
				if ( blockToSelect ) {
					selectBlock( blockToSelect.id );
					// Optional: Scroll the block into view
					const blockElement = document.querySelector(
						`#${ blockToSelect.id }`
					);
					if ( blockElement ) {
						blockElement.scrollIntoView( {
							behavior: 'smooth',
							block: 'center',
						} );
					}
				}
			};

			return (
				<Fragment>
					<BlockEdit { ...props } />
					<InspectorControls>
						<PanelBody title="Accessibility">
							{ isEditing ? (
								<div>
									<FormTokenField
										label={ __(
											'Element Described By',
											'visua11y-infographic'
										) }
										value={ tokens }
										suggestions={ allAnchors.map(
											( item ) => item.anchor
										) } // Suggest existing anchors
										onChange={ ( newTokens ) =>
											setTokens( newTokens )
										}
										__experimentalExpandOnFocus
										help={ __(
											'Enter one or more "HTML anchor" values, separated by spaces.',
											'visua11y-infographic'
										) }
									/>
									<Button
										variant="primary"
										onClick={ handleSave }
										style={ { marginTop: '8px' } }
									>
										Save
									</Button>
								</div>
							) : (
								<div>
									<p>
										{ _n(
											'Describing element:',
											'Describing elements:',
											tokens.length,
											'visua11y-infographic'
										) + '  ' }
										{ tokens.map( ( token, index ) => (
											<Fragment key={ index }>
												<a
													href={ `#${ token }` }
													onClick={ ( e ) => {
														e.preventDefault();
														handleAnchorClick(
															token
														);
													} }
													style={ {
														cursor: 'pointer',
														color: '#0073aa',
													} }
												>
													#{ token }
												</a>
												{ index < tokens.length - 1
													? ', '
													: '' }
											</Fragment>
										) ) }
									</p>
									<Button
										variant="secondary"
										onClick={ () => setIsEditing( true ) }
										style={ { marginTop: '8px' } }
									>
										Edit
									</Button>
								</div>
							) }
						</PanelBody>
					</InspectorControls>
				</Fragment>
			);
		};
	},
	'withAriaDescribedbyControl'
);

addFilter(
	'editor.BlockEdit',
	'custom/image-aria-describedby-sidebar',
	withAriaDescribedbyControl
);

// 3️⃣ Modify the editor preview (editor only)
const applyAriaDescribedbyToEditor = ( element, blockType, attributes ) => {
	if ( blockType.name !== 'core/image' || ! attributes.ariaDescribedby ) {
		return element;
	}

	if ( element.type === 'figure' && element.props.children ) {
		const children = Array.isArray( element.props.children )
			? element.props.children
			: [ element.props.children ];

		return {
			...element,
			props: {
				...element.props,
				children: children.map( ( child ) => {
					if ( child?.type === 'img' ) {
						return {
							...child,
							props: {
								...child.props,
								'aria-describedby': attributes.ariaDescribedby,
							},
						};
					}
					return child;
				} ),
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
const applyAriaDescribedbyToSave = ( element, blockType, attributes ) => {
	if ( blockType.name === 'core/image' && attributes.ariaDescribedby ) {
		if (
			element &&
			element.props &&
			element.type === 'figure' &&
			element.props.children
		) {
			const children = Array.isArray( element.props.children )
				? element.props.children
				: [ element.props.children ];

			return {
				...element,
				props: {
					...element.props,
					children: children.map( ( child ) => {
						if ( child && child.props && child.props.children ) {
							// Check if the inner children contain the img element.
							const innerChildren = Array.isArray(
								child.props.children
							)
								? child.props.children
								: [ child.props.children ];
							const updatedInnerChildren = innerChildren.map(
								( innerChild ) => {
									if (
										innerChild &&
										innerChild.type === 'img'
									) {
										return {
											...innerChild,
											props: {
												...innerChild.props,
												'aria-describedby':
													attributes.ariaDescribedby,
											},
										};
									}
									return innerChild;
								}
							);
							return {
								...child,
								props: {
									...child.props,
									children: updatedInnerChildren,
								},
							};
						}
						return child;
					} ),
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

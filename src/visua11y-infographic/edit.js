import { __ } from '@wordpress/i18n';
import { useBlockProps, BlockControls, InnerBlocks } from '@wordpress/block-editor';
import { useState } from '@wordpress/element';
import { rawHandler } from '@wordpress/blocks';
import { showSnackbar } from './lib/showSnackbar';
import { blocksToTemplate } from './lib/blocksToTemplate';
import {
	MediaUpload,
	MediaUploadCheck
} from '@wordpress/block-editor';
import {
	Placeholder,
	Button,
	Icon,
	chartBar,
	ToolbarGroup,
	ToolbarButton,
	ToolbarItem,
	SelectControl,
	CheckboxControl
} from '@wordpress/components';
import { dispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { isEmpty, template } from 'lodash';
import LabeledSeparator from './LabeledSeparator';
import generateAnchor from './lib/generateAnchor';
import './editor.scss';

export default function Edit( { clientId, attributes, setAttributes } ) {

	// props
	const { media, generatedData } = attributes;

	// states
	const [ isLoading, setIsLoading ] = useState( false );
	const [ blockTemplate, setBlockTemplate ] = useState( null );
	// const [ alternativeType, setAlternativeType ] = useState( 'table-and-description' );
	const [ includeImage, setIncludeImage ] = useState( true );
	const [ includeSummary, setIncludeSummary ] = useState( true );
	const [ includeDataTable, setIncludeDataTable ] = useState( true );
	const [ includeContext, setIncludeContext ] = useState( true );
	const [ outputFormat, setOutputFormat ] = useState( 'directly-below-image' );

	// hooks
	const { replaceInnerBlocks } = dispatch( "core/block-editor" );
	const { innerBlocks } = useSelect( select => ( {
		innerBlocks: select( "core/block-editor" ).getBlocks( clientId )
	} ) );

	/**
	 * Remove all inner blocks from the block
	 */
	const removeInnerBlocks = () => {
		setBlockTemplate( null );
		replaceInnerBlocks( clientId, [] );
	};

	/**
	 * Handle the selection of a media item
	 * @param {Object} selectedMedia
	 */
	const onSelectMedia = ( selectedMedia ) => {
		removeInnerBlocks();
		setAttributes( {
			media: {
				id: selectedMedia.id,
				url: selectedMedia.url
			}
		} );
	};

	/**
	 * Remove the media from the block and reset the generated HTML
	 */
	const onRemoveMedia = () => {
		removeInnerBlocks();
		setAttributes( { media: {}, generatedData: null } );
	};

	/**
	 * Generate the HTML for the accessible alternative using the API.
	 * 
	 * @param {Object} args
	 * @param {string} args.imageURL
	 * @param {string} args.alternativeType
	 * @returns 
	 */
	const generateHTML = async ( args ) => {

		// prepare the block for the new content
		setIsLoading( true );
		setAttributes( { generatedData: null } );
		removeInnerBlocks();

		const {
			imageURL,
			// alternativeType
		} = args;

		try {
			const response = await fetch( 'https://wordpress-1111654-5343094.cloudwaysapps.com/wp-json/accessible-infographic/v1/analyze/', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					/**
					 * @todo this leads to a CORS error on most sites
					 * @todo we need to find a way to make this work
					 */
					// 'X-API-Key': 'v11y_api_7f3d8b2e4a6c9f1d5e0b7a2c4d6e8f0a'
				},
				body: JSON.stringify( {
					image: imageURL,
					response_type: 'html'
				} )
			} );

			if ( !response.ok ) {
				showSnackbar( __( 'Network response was not ok', 'visua11y-infographic' ), {
					style: 'error',
					isDismissible: true,
					icon: '⚠️'
				} );
				return;
			}

			const data = await response.json();
			console.log( 'raw data:', data );

			if ( !data || !data.summary || !data.values ) {
				if ( data && data?.message ) {
					showSnackbar( data.message + __( ' Make sure the image url is publicly accessible.', 'visua11y-infographic' ), {
						style: 'error',
						isDismissible: true,
						icon: '⚠️'
					} );
					return;
				}
			}

			// save the generated HTML to the block
			setAttributes( { generatedData: data } );

			// process the data
			const { summary, values, context } = data;

			// generate html
			let [ summaryTemplate, valuesTemplate, contextTemplate ] = [ [], [], [] ];
			if ( summary ) {
				summaryTemplate = blocksToTemplate( rawHandler( { HTML: summary } ) );
			}
			if ( values ) {
				valuesTemplate = blocksToTemplate( rawHandler( { HTML: values } ) );
			}
			if ( context ) {
				contextTemplate = blocksToTemplate( rawHandler( { HTML: context } ) );
			}

			const templateMarkup = [
				[ 'core/group', {
					className: 'visua11y-infographic-summary',
					lock: {
						move: true,
						remove: true
					},
					metadata:{
						name: "Summary"
					}
				}, [
					[ 'core/heading', { level: 3, content: __( 'Summary', 'visua11y-infographic' ) } ],
					...summaryTemplate
				] ],
				[ 'core/group', {
					className: 'visua11y-infographic-values',
					lock: {
						move: true,
						remove: true
					},
					metadata:{
						name: "Values"
					}
				}, [
					[ 'core/heading', { level: 3, content: __( 'Values', 'visua11y-infographic' ) } ],
					...valuesTemplate
				] ],
				[ 'core/group', {
					className: 'visua11y-infographic-context',
					lock: {
						move: true,
						remove: true
					},
					metadata:{
						name: "Context"
					}
				}, [
					[ 'core/heading', { level: 3, content: __( 'Context', 'visua11y-infographic' ) } ],
					...contextTemplate
				] ]
			]

			setBlockTemplate( templateMarkup );

			showSnackbar(
				__( 'Generated Accessible Alternative', 'visua11y-infographic' ),
				{
					style: 'success',
					isDismissible: true,
					icon: '🎉'
				}
			);
		} catch ( error ) {
			console.error( 'Error generating HTML:', error );
			showSnackbar( error.message, {
				style: 'error',
				isDismissible: true,
				icon: '⚠️'
			} );
		} finally {
			setIsLoading( false );
		}
	};

	/**
	 * Insert the generated blocks into the editor and remove this block
	 */
	const insertBlocks = ( options ) => {

		const { includeImage, includeSummary, includeDataTable, includeContext } = options;
		const anchor = generateAnchor();

		// create the blocks
		const blocks = [];
		if (includeImage) {
			blocks.push(createBlock( 'core/image', {
				...media,
				ariaDescribedby: anchor
			}));
		}
		const detailsInnerBlocks = [];
		if (includeSummary) {
			const summaryBlock = innerBlocks.find( block => block.name === 'core/group' && block.attributes.className === 'visua11y-infographic-summary' );

			// get the inner blocks of the group block
			const summaryInnerBlocks = summaryBlock?.innerBlocks;
			if (summaryInnerBlocks) {
				summaryInnerBlocks.forEach( block => {
					detailsInnerBlocks.push( block );
				} );
			}
		}
		if (includeDataTable) {
			const valuesBlock = innerBlocks.find( block => block.name === 'core/group' && block.attributes.className === 'visua11y-infographic-values' );

			// get the inner blocks of the group block
			const valuesInnerBlocks = valuesBlock?.innerBlocks;
			if (valuesInnerBlocks) {
				valuesInnerBlocks.forEach( block => {
					detailsInnerBlocks.push( block );
				} );
			}
		}
		if (includeContext) {
			const contextBlock = innerBlocks.find( block => block.name === 'core/group' && block.attributes.className === 'visua11y-infographic-context' );

			// get the inner blocks of the group block
			const contextInnerBlocks = contextBlock?.innerBlocks;
			if (contextInnerBlocks) {
				contextInnerBlocks.forEach( block => {
					detailsInnerBlocks.push( block );
				} );
			}
		}

		let wrappedInnerBlocks;
		if (outputFormat === 'details-below-image') {
			const detailsBlock = createBlock( 'core/group', {
				anchor: anchor
			}, [
				createBlock( 'core/details', {
					summary: __( 'Accessible alternative for the infographic', 'visua11y-infographic' ),
				}, detailsInnerBlocks )
			] );
			blocks.push(detailsBlock);
			wrappedInnerBlocks = createBlock( 'core/group', {}, blocks );
		}
		else if (outputFormat === 'directly-below-image') {
			wrappedInnerBlocks = createBlock( 'core/group', {}, [
				...blocks,
				createBlock( 'core/group', {}, [
					createBlock( 'core/heading', {
						level: 2,
						content: __( 'Accessible alternative for the infographic', 'visua11y-infographic' ),
						anchor: anchor
					} ),
					...detailsInnerBlocks
				] )
			] );
		}
		else if (outputFormat === 'next-to-image') {
			wrappedInnerBlocks = createBlock( 'core/columns', {
				align: 'wide'
			}, [
				createBlock( 'core/column', {}, blocks ),
				createBlock( 'core/column', {}, [
					createBlock( 'core/group', {}, [
						createBlock( 'core/heading', {
							level: 2,
							content: __( 'Accessible alternative for the infographic', 'visua11y-infographic' ),
							anchor: anchor
						} ),
						...detailsInnerBlocks
					] )
				] )
			] );
		}

		// remove this block
		dispatch( 'core/block-editor' ).removeBlocks( [ clientId ] );

		// insert the blocks
		dispatch( 'core/editor' ).insertBlocks( wrappedInnerBlocks );
	};

	return (
		<div {...useBlockProps()}>
			<BlockControls>
				<ToolbarGroup>
					<MediaUploadCheck>
						<MediaUpload
							allowedTypes={[ 'image/jpeg', 'image/png', 'image/svg+xml' ]}
							value={media?.id || ''}
							render={( { open } ) => (
								<ToolbarItem>
									{() => (
										<ToolbarButton onClick={open} label={__( 'Change Media', 'visua11y-infographic' )}>
											{/* <Icon icon={edit} /> */}
											{
												( media && Object.keys( media ).length !== 0 )
													? __( 'Change image', 'visua11y-infographic' )
													: __( 'Select image', 'visua11y-infographic' )}
										</ToolbarButton>
									)}
								</ToolbarItem>
							)}
						/>
					</MediaUploadCheck>
					{media && Object.keys( media ).length !== 0 && (
						<ToolbarItem>
							{() => (
								<ToolbarButton onClick={onRemoveMedia} label={__( 'Remove image', 'visua11y-infographic' )} isDestructive>
									{__( 'Remove image', 'visua11y-infographic' )}
								</ToolbarButton>
							)}
						</ToolbarItem>
					)}
				</ToolbarGroup>
			</BlockControls>
			<Placeholder
				label="Visua11y Infographic"
				icon={<Icon icon={chartBar} />}
			>
				{!media || Object.keys( media ).length === 0 ? (
					<div className="media-placeholder">
						<MediaUploadCheck>
							<MediaUpload
								allowedTypes={[ 'image/jpeg', 'image/png', 'image/svg+xml' ]}
								value={media?.id || ''}
								render={( { open } ) => (
									<Button onClick={open} variant="secondary">
										{__( 'Select image', 'visua11y-infographic' )}
									</Button>
								)}
								onSelect={onSelectMedia}
							/>
						</MediaUploadCheck>
					</div>
				) : (
					<div className="media-container" style={{ backgroundImage: `url(${ media.url })` }}>
						{/* Image is displayed as background */}
					</div>
				)}
				<Button
					onClick={() => generateHTML( {
						imageURL: media.url,
						// alternativeType: alternativeType
					} )}
					variant="secondary"
					className={isLoading ? 'large-button is-busy' : 'large-button'}
					disabled={!media || Object.keys( media ).length === 0}
				>
					{(
						!isEmpty(generatedData)
							? __( 'Regenerate', 'visua11y-infographic' )
							: (
								isLoading
									? __( 'Generating...', 'visua11y-infographic' )
									: __( 'Generate Accessible Alternative', 'visua11y-infographic' )
							)
					)}
				</Button>
				{!isEmpty(generatedData) && (
					<>
						<LabeledSeparator label={__( 'Generated Alternative', 'visua11y-infographic' )} />
						<InnerBlocks template={blockTemplate} />
						<LabeledSeparator label={__( 'Insert', 'visua11y-infographic' )} />

						<CheckboxControl
							label={__( 'Image', 'visua11y-infographic' )}
							title={__( 'Include Image', 'visua11y-infographic' )}
							checked={includeImage}
							onChange={setIncludeImage}
						/>
						<CheckboxControl
							label={__( 'Summary', 'visua11y-infographic' )}
							title={__( 'Include Summary', 'visua11y-infographic' )}
							checked={includeSummary}
							onChange={setIncludeSummary}
						/>
						<CheckboxControl
							label={__( 'Data Table', 'visua11y-infographic' )}
							title={__( 'Include Data Table', 'visua11y-infographic' )}
							checked={includeDataTable}
							onChange={setIncludeDataTable}
						/>
						<CheckboxControl
							label={__( 'Context', 'visua11y-infographic' )}
							title={__( 'Include Context', 'visua11y-infographic' )}
							checked={includeContext}
							onChange={setIncludeContext}
						/>
						<SelectControl
							label={__( 'Output Format', 'visua11y-infographic' )}
							value={outputFormat}
							options={[
								{ label: __( 'Alternative directly below image', 'visua11y-infographic' ), value: 'directly-below-image' },
								{ label: __( 'Alternative inside details below the image', 'visua11y-infographic' ), value: 'details-below-image' },
								{ label: __( 'Alternative next to the image', 'visua11y-infographic' ), value: 'next-to-image' }
							]}
							onChange={setOutputFormat}
						/>
						<Button
							onClick={() => insertBlocks( { includeImage, includeSummary, includeDataTable, includeContext } )}
							variant="primary"
							className="large-button"
						>
							{__( 'Insert as Blocks', 'visua11y-infographic' )}
						</Button>
					</>
				)}
			</Placeholder>
		</div>
	);
}

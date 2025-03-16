import { __ } from '@wordpress/i18n';
import { useBlockProps, BlockControls, InnerBlocks } from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';
import { rawHandler } from '@wordpress/blocks';
import { getMarkup } from './lib/getMarkup';
import { showSnackbar } from './lib/showSnackbar';
import { blocksToTemplate } from './lib/blocksToTemplate';
import {
	MediaUpload,
	MediaUploadCheck
} from '@wordpress/block-editor';
import {
	Placeholder,
	Button,
	Modal,
	Icon,
	chartBar,
	ToolbarGroup,
	ToolbarButton,
	ToolbarItem,
	SelectControl
} from '@wordpress/components';
import { dispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import './editor.scss';

export default function Edit( { clientId, attributes, setAttributes } ) {

	// props
	const { media, generatedHTML } = attributes;

	// states
	const [ isLoading, setIsLoading ] = useState( false );
	const [ blockTemplate, setBlockTemplate ] = useState( null );
	// const [ alternativeType, setAlternativeType ] = useState( 'table-and-description' );

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
		setAttributes( { media: {}, generatedHTML: null } );
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
		setAttributes( { generatedHTML: null } );
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

			let newHtml = '';
			// if ( args.alternativeType === 'table-and-description' ) {
				newHtml = data.summary + data.values;
			// } else if ( args.alternativeType === 'description' ) {
			// 	newHtml = data.summary;
			// } else if ( args.alternativeType === 'table' ) {
			// 	newHtml = data.values;
			// }

			setAttributes( { generatedHTML: newHtml } );
			const blocks = rawHandler( { HTML: generatedHTML } );
			const template = blocksToTemplate( blocks );
			setBlockTemplate( template );
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
	const insertBlocks = () => {

		// create the blocks
		const imageBlock = createBlock( 'core/image', media );
		const detailsBlock = createBlock( 'core/details', {
			summary: __( 'Accessible alternative for the infographic', 'visua11y-infographic' )
		}, innerBlocks );
		const wrappedInnerBlocks = createBlock( 'core/group', {}, [
			imageBlock,
			detailsBlock
		] );

		// insert the blocks
		dispatch( 'core/editor' ).insertBlocks( wrappedInnerBlocks );

		// remove this block
		dispatch( 'core/block-editor' ).removeBlocks( [ clientId ] );
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
							onSelect={onSelectMedia}
						/>
					</MediaUploadCheck>
					{media && Object.keys( media ).length !== 0 && (
						<ToolbarItem>
							{() => (
								<ToolbarButton onClick={onRemoveMedia} label={__( 'Remove image', 'visua11y-infographic' )} isDestructive>
									{/* <Icon icon={trash} /> */}
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
				{/* <SelectControl
					label={__( 'Type of alternative', 'visua11y-infographic' )}
					value={alternativeType}
					options={[
						{ label: __( 'Table and Description', 'visua11y-infographic' ), value: 'table-and-description' },
						{ label: __( 'Just description', 'visua11y-infographic' ), value: 'description' },
						{ label: __( 'Just table', 'visua11y-infographic' ), value: 'table' },
					]}
					onChange={( value ) => setAlternativeType( value )}
					help={__( 'What kind of format should the alternative have', 'visua11y-infographic' )}
				/> */}
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
						generatedHTML
							? __( 'Regenerate', 'visua11y-infographic' )
							: (
								isLoading
									? __( 'Generating...', 'visua11y-infographic' )
									: __( 'Generate Accessible Alternative', 'visua11y-infographic' )
							)
					)}
				</Button>
				{generatedHTML && (
					// <div className="output-container">
					// 	<div dangerouslySetInnerHTML={{ __html: blockTemplate }} />
					// </div>
					<InnerBlocks template={blockTemplate} />
				)}
				{generatedHTML && (
					<Button
						onClick={() => insertBlocks( blockTemplate )}
						variant="primary"
						className="large-button"
					>
						{__( 'Insert Accessible Alternative', 'visua11y-infographic' )}
					</Button>
				)}
			</Placeholder>
		</div>
	);
}

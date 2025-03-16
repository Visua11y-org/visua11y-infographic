import { __ } from '@wordpress/i18n';
import { useBlockProps, BlockControls, InnerBlocks } from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';
import { rawHandler } from '@wordpress/blocks';
import { getMarkup } from './lib/getMarkup';
import { blocksToTemplate, innerBlocksToTemplate } from './lib/blocksToTemplate';
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
import { edit, trash } from '@wordpress/icons';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const { media, generatedHTML } = attributes;
	const [ isLoading, setIsLoading ] = useState(false);
	const [ temporaryHTML, setTemporaryHTML ] = useState(null);
	const [ alternativeType, setAlternativeType ] = useState('table-and-description');
	const blocks = rawHandler({ HTML: getMarkup() })
	const blocksTemplate = blocksToTemplate(blocks);

	const onSelectMedia = ( selectedMedia ) => {
		setAttributes( { media: selectedMedia } );
	};

	const onRemoveMedia = () => {
		setAttributes( { media: {}, generatedHTML: null } );
	};

	const generateHTML = ( args ) => {
		setTemporaryHTML(null);
		setIsLoading(true);
		setTimeout(() => {
			/**
			 * @todo use alternativeType to generate the HTML
			 */
			setTemporaryHTML(getMarkup());
			setIsLoading(false);
		}, 2000);
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
												(media && Object.keys( media ).length !== 0)
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
								<ToolbarButton onClick={onRemoveMedia} label={__( 'Remove Media', 'visua11y-infographic' )} isDestructive>
									{/* <Icon icon={trash} /> */}
									{__( 'Remove', 'visua11y-infographic' )}
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
				<SelectControl
					label={__('Type of alternative', 'visua11y-infographic')}
					value={alternativeType}
					options={[
						{ label: __('Table and Description', 'visua11y-infographic'), value: 'table-and-description' },
						{ label: __('Just description', 'visua11y-infographic'), value: 'description' },
						{ label: __('Just table', 'visua11y-infographic'), value: 'table' },
					]}
					onChange={(value) => setAlternativeType(value)}
					help={__('What kind of format should the alternative have', 'visua11y-infographic')}
				/>
				<Button
					onClick={() => generateHTML({ alternativeType: alternativeType })}
					variant="secondary"
					className={isLoading ? 'large-button is-busy' : 'large-button'}
					disabled={!media || Object.keys(media).length === 0}
				>
					{(
						temporaryHTML
						? __( 'Regenerate', 'visua11y-infographic' )
						: (
							isLoading
							? __( 'Generating...', 'visua11y-infographic' )
							: __( 'Generate Accessible Alternative', 'visua11y-infographic' )
						)
					)}
				</Button>
				{temporaryHTML && (
					// <div className="output-container">
					// 	<div dangerouslySetInnerHTML={{ __html: temporaryHTML }} />
					// </div>
					<InnerBlocks template={blocksTemplate} />
				)}
			</Placeholder>
		</div>
	);
}

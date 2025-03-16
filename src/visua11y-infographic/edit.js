import { __ } from '@wordpress/i18n';
import { useBlockProps, BlockControls } from '@wordpress/block-editor';
import { useState, useEffect } from '@wordpress/element';
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
	ToolbarItem
} from '@wordpress/components';
import { edit, trash } from '@wordpress/icons';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const { media, generatedHTML } = attributes;
	const [ isLoading, setIsLoading ] = useState(false);
	const [ temporaryHTML, setTemporaryHTML ] = useState(null);

	const onSelectMedia = ( selectedMedia ) => {
		setAttributes( { media: selectedMedia } );
	};

	const onRemoveMedia = () => {
		setAttributes( { media: {}, generatedHTML: null } );
	};

	const generateHTML = () => {
		setTemporaryHTML(null);
		setIsLoading(true);
		setTimeout(() => {
			const htmlString = `<table>
  <tr>
    <th>Header 1</th>
    <th>Header 2</th>
  </tr>
  <tr>
    <td>Data 1</td>
    <td>Data 2</td>
  </tr>
</table>`;
			setTemporaryHTML(htmlString);
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
				<Button
					onClick={() => generateHTML()}
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
					<div className="output-container">
						<div dangerouslySetInnerHTML={{ __html: temporaryHTML }} />
					</div>
				)}
			</Placeholder>
		</div>
	);
}
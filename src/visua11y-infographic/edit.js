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
	ToolbarItem
} from '@wordpress/components';
import { edit, trash } from '@wordpress/icons';
import './editor.scss';

export default function Edit( { attributes, setAttributes } ) {
	const { media, generatedHTML } = attributes;
	const [ isModalOpen, setIsModalOpen ] = useState( false );
	const [isLoading, setIsLoading] = useState(false);
	const [tableHTML, setTableHTML] = useState('');
	const blocks = rawHandler({ HTML: getMarkup() })
	const blocksTemplate = blocksToTemplate(blocks);

	const onSelectMedia = ( selectedMedia ) => {
		setAttributes( { media: selectedMedia } );
	};

	const onRemoveMedia = () => {
		setAttributes( { media: {}, generatedHTML: null } );
	};

	useEffect(() => {
		if (isModalOpen) {
			setIsLoading(true);
			setTimeout(() => {
				setTableHTML(getMarkup());
				setIsLoading(false);
			}, 2000);
		}
	}, [isModalOpen]);

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
				<InnerBlocks template={blocksTemplate} />
				<Button
					onClick={() => setIsModalOpen(true)}
					variant="primary"
					className="large-button"
					disabled={!media || Object.keys(media).length === 0}
				>
					{__( 'Create Accessible Alternative', 'visua11y-infographic' )}
				</Button>
			</Placeholder>

			{isModalOpen && (
				<Modal
					title={__( 'Create an accessible alternative', 'visua11y-infographic' )}
					onRequestClose={() => setIsModalOpen( false )}
					shouldCloseOnEsc={true}
					shouldCloseOnClickOutside={true}
					className="is-fullscreen"
				>
						<div className="modal-content-wrapper">
							<div className="modal-left-side">
								<img src={media.url} alt={__( 'Selected Media', 'visua11y-infographic' )} style={{ maxWidth: '100%', maxHeight: '500px' }} />
							</div>
							<div className="modal-right-side">
								{isLoading ? (
									<div className="loader">Loading...</div>
								) : (
									<pre>{tableHTML}</pre>
								)}
							</div>
							<div className="modal-bottom-bar">
								<Button onClick={() => setIsModalOpen( false )} variant="primary" disabled>
									{__( 'Save', 'visua11y-infographic' )}
								</Button>
							</div>
						</div>
				</Modal>
			)}
		</div>
	);
}

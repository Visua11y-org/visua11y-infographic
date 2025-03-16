export const innerBlocksToTemplate = (innerBlocks) => {
	return innerBlocks.map(block => [
		block.name,
		{ ...block.attributes },
		block.innerBlocks ? convertInnerBlocksToTemplate(block.innerBlocks) : []
	]);
};

export const blocksToTemplate = blocks => blocks.map(block => {
	return [
		block.name,
		{ ...block.attributes },
		block.innerBlocks ? block.innerBlocks.map(block => [
			block.name,
			{ ...block.attributes },
			block.innerBlocks ? innerBlocksToTemplate(block.innerBlocks) : []
		]) : []
	];
});

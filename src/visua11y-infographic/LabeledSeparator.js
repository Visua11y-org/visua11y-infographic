import React from 'react';
import './LabeledSeparator.scss';

const LabeledSeparator = ({ label }) => {
	return (
		<div className="labeled-separator">
			<hr />
			<span>{label}</span>
			<hr />
		</div>
	);
};

export default LabeledSeparator;

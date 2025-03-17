<?php

/**
 * Plugin Name:       Visua11y Infographic
 * Description:       A Infographic that lets you create accessible infographics from simply uploading an image.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            Visua11y Cloudfest 2025 Hackathon team members
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       visua11y-infographic
 *
 * @package CreateBlock
 */

if (! defined('ABSPATH')) {
	exit; // Exit if accessed directly.
}

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */


function create_block_visua11y_infographic_block_init()
{
	$block_types = array('visua11y-infographic');
	foreach ($block_types as $block_type) {
		register_block_type(__DIR__ . "/build/{$block_type}");
	}

	$api_url = 'const visua11yInfographicApiURL = "' . (defined('VISUA11Y_API_URL') ? VISUA11Y_API_URL : 'xxx') . '";';
	wp_add_inline_script(
		'wp-blocks',
		$api_url,
		'after'
	);

	/**
	 * Registering blocks using blocks-manifest.php file.
	 * This is the recommended way to register blocks since WordPress 6.8.
	 * Unfortunatelly, this is causing issues, deleting the blocks-manifest.php inside
	 * the build folder when npm start is run.
	 * @see https://make.wordpress.org/core/2025/03/13/more-efficient-block-type-registration-in-6-8/
	 */
	// if (function_exists('wp_register_block_types_from_metadata_collection')) { // Function introduced in WordPress 6.8.
	// 	wp_register_block_types_from_metadata_collection(__DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php');
	// } else {
	// 	if (function_exists('wp_register_block_metadata_collection')) { // Function introduced in WordPress 6.7.
	// 		wp_register_block_metadata_collection(__DIR__ . '/build', __DIR__ . '/build/blocks-manifest.php');
	// 	}
	// 	$manifest_data = require __DIR__ . '/build/blocks-manifest.php';
	// 	foreach (array_keys($manifest_data) as $block_type) {
	// 		register_block_type(__DIR__ . "/build/{$block_type}");
	// 	}
	// }
}
add_action('init', 'create_block_visua11y_infographic_block_init');

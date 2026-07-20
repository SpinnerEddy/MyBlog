import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
			category: z.enum(['article', 'sketch', 'portfolio', 'event', 'hobby', 'other']).default('article'),
			noindex: z.boolean().default(false),
		}),
});

const about = defineCollection({
	// Load the About page's Markdown content from `src/content/about/`.
	loader: glob({ base: './src/content/about', pattern: '**/*.md' }),
	schema: z.object({
		name: z.string(),
		icon: z.string(),
	}),
});

export const collections = { blog, about };

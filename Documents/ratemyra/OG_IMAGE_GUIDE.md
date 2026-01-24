# Creating a Professional OG Image

To create a proper og-image (1200x630px) with your logo and text:

## Option 1: Use Canva (Recommended)
1. Go to https://www.canva.com
2. Create a custom size: 1200x630px
3. Add your logo (from `client/public/favicon.png`) on the left side, size it to ~200x200px
4. Add text on the right:
   - Title: "RateMyRA" (large, bold)
   - Subtitle: "Share Your Honest RA Feedback"
   - Tagline: "Your voice matters"
5. Export as PNG
6. Save to `client/public/og-image.png`

## Option 2: Use Online OG Image Generators
- https://www.bannerbear.com/tools/open-graph-image-generator/
- https://og-image.vercel.app/

## Current Setup
The site is currently using `apple-touch-icon.png` (180x180) which won't stretch but is small.

Once you create a proper 1200x630 og-image.png, update `client/index.html`:
- Change `og:image` to point to `/og-image.png`
- Update width to `1200` and height to `630`

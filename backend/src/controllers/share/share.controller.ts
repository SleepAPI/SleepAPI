import { ShareParams } from '@src/routes/share-router/share-router';
import { Request as Protocol } from 'express';
import sharp from 'sharp';
import { Controller, Get, Hidden, Queries, Request, Route } from 'tsoa';

export default class ShareController extends Controller {
  @Route('share')
  @Hidden()
  @Get('/')
  public async getCustomSite(
    @Queries() queryParams: ShareParams,
    @Request() request: Protocol<unknown, unknown, unknown, ShareParams>
  ) {
    const pkmn = queryParams.pokemon;
    const title = `See my ${pkmn} calculation on Sleep API!`;
    // const description = pkmn; // TODO: maybe not use?

    const protocol = request.protocol;
    const host = request.get('host');
    const baseUrl = `${protocol}://${host}`;

    const imageUrl = `${baseUrl}/api/image?pokemon=${encodeURIComponent(pkmn)}`;
    const prodCalcUrl = `${baseUrl}/production-calculator.html`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>See my ${pkmn} calculation on Sleep API!</title>
        <meta property="og:title" content="${title}">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="600">
        <meta property="og:url" content="${this.#getFullUrl(request)}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:image" content="${imageUrl}">
    </head>
    <body>
      <div>
        <img src="${imageUrl}" alt="Dynamic Image" />
      </div>
      <button onclick="location.href='${prodCalcUrl}'" type="button">
         Calculate new Pokémon</button>
    </body>
    </html>
    `;
    return htmlContent;
  }

  @Route('image')
  @Hidden()
  @Get('/')
  public async getImage(@Queries() queryParams: ShareParams) {
    const { pokemon } = queryParams;

    const width = 1200;
    const height = 600;
    const svgImage = `
    <svg width="${width}" height="${height}">
        <style>
            .title { fill: #ddd; font-size: 24px; font-family: Arial; }
            .desc { fill: #ddd; font-size: 20px; font-family: Arial; }
        </style>
        <rect width="100%" height="100%" fill="#555"/>
        <text x="10" y="40" class="title">${pokemon}</text>
        <text x="10" y="80" class="desc">${pokemon}</text>
    </svg>
    `;

    // if smaller images are needed for loading time
    //alt 1
    // sharp(buffer)
    // .jpeg({ quality: 80 }) // Reducing the quality to 80%
    // .toBuffer();
    //alt 2
    // sharp(buffer)
    // .png({ quality: 80, palette: true })
    // .toBuffer();

    return await sharp(Buffer.from(svgImage)).toFormat('png').toBuffer();
  }

  #getFullUrl(req: Protocol<unknown, unknown, unknown, ShareParams>) {
    const protocol = req.protocol;
    const host = req.get('host');
    const originalUrl = req.originalUrl;

    return `${protocol}://${host}${originalUrl}`;
  }
}

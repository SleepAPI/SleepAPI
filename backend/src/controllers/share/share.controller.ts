import { ShareParams } from '@src/routes/share-router/share-router';
import { Request as Protocol } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
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
        <meta property="og:image:alt" content="Pokémon Sleep production calculator result">
        <meta property="og:url" content="${this.#getFullUrl(request)}">
        <meta property="og:type" content="website">
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
    const pokemonCapitalized = `${pokemon[0].toUpperCase()}${pokemon.toLowerCase().slice(1)}`;

    const width = 1200;
    const height = 600;

    const sneaselIcon = readFileSync(path.join(__dirname, '../../assets/cook.png')).toString('base64');

    const svgImage = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <style>
        .title { fill: #FFF; font-size: 96px; font-family: Arial; }
        .desc { fill: #FFF; font-size: 20px; font-family: Arial; }
      </style>
      <rect width="100%" height="95%" fill="#555"/>
      <rect y="95%" width="100%" height="5%" fill="#f04545"/>
      <text x="200" y="150" class="title">${pokemonCapitalized}</text>
      <text x="200" y="200" class="desc">${pokemon}</text>
      <image x="1050" y="500" width="50" height="50" xlink:href="data:image/png;base64,${sneaselIcon}"/>
    </svg>
    `;

    return await sharp(Buffer.from(svgImage)).toFormat('png').toBuffer();
  }

  #getFullUrl(req: Protocol<unknown, unknown, unknown, ShareParams>) {
    const protocol = req.protocol;
    const host = req.get('host');
    const originalUrl = req.originalUrl;

    return `${protocol}://${host}${originalUrl}`;
  }
}

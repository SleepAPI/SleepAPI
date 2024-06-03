import { ShareParams } from '@src/routes/share-router/share-router';
import { SimplifiedIngredientSet } from '@src/services/set-cover/set-cover';
import { prettifyIngredientDrop, shortPrettifyIngredientDrop } from '@src/utils/json/json-utils';
import { Request as Protocol } from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getIngredient } from 'sleepapi-common';
import { Controller, Get, Hidden, Queries, Request, Route } from 'tsoa';

export default class ShareController extends Controller {
  @Route('share')
  @Hidden()
  @Get('/')
  public async getCustomSite(
    @Queries() queryParams: ShareParams,
    @Request() request: Protocol<unknown, unknown, unknown, ShareParams>
  ) {
    const { pokemon, ingredientSet, producedIngredients, skillProcs } = queryParams;

    const producedIngredientsSplit = producedIngredients.split('x').map((ingCombo) => {
      const match = ingCombo.match(/^(\d+(\.\d+)?)([a-zA-Z]+)$/);

      const amount = parseFloat(match?.at(1) ?? '-1');
      const ingredient = match?.at(3) ?? 'unknown';
      return {
        amount: +amount,
        ingredient: getIngredient(ingredient),
      };
    });
    const producedIngredientsPretty = prettifyIngredientDrop(producedIngredientsSplit);

    const pokemonCapitalized = `${pokemon[0].toUpperCase()}${pokemon.slice(1).toLowerCase()}`;
    const ingredientSetSplit = ingredientSet.split('x').map((ingCombo) => {
      const match = ingCombo.match(/^(\d+(\.\d+)?)([a-zA-Z]+)$/);

      const amount = parseFloat(match?.at(1) ?? '-1');
      const ingredient = match?.at(3) ?? 'unknown';
      return {
        amount: +amount,
        ingredient: getIngredient(ingredient),
      };
    });
    const ingredientSetPretty = shortPrettifyIngredientDrop(ingredientSetSplit);
    const description = `${pokemonCapitalized}(${ingredientSetPretty}) produced ${producedIngredientsPretty}, estimated ${skillProcs} skill procs`;

    const title = `See my ${pokemon} calculation on Sleep API!`;
    const protocol = request.protocol;
    const host = request.get('host');
    const baseUrl = `${protocol}://${host}`;

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        params.set(key, String(value));
      }
    }
    const imageUrl = `${baseUrl}/api/image?${params.toString()}`;
    const prodCalcUrl = `${baseUrl}/production-calculator.html`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>See my ${pokemon} calculation on Sleep API!</title>
        <meta property="og:title" content="${title}">
        <meta property="og:image" content="${imageUrl}">
        <meta property="og:image:width" content="1200">
        <meta property="og:description" content="${description}">
        <meta property="og:image:height" content="600">
        <meta property="og:image:alt" content="Pokémon Sleep production calculator result">
        <meta property="og:url" content="${this.#getFullUrl(request)}">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="${title}">
        <meta name="twitter:description" content="${description}">
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
    const { pokemon, ingredientSet, producedIngredients } = queryParams;

    const width = 1200;
    const height = 600;

    const sneaselIcon = readFileSync(path.join(__dirname, '../../assets/cook.png')).toString('base64');
    const splitProducedIngredients: SimplifiedIngredientSet[] = producedIngredients.split('x').map((ing) => {
      const match = ing.match(/^(\d+(\.\d+)?)([a-zA-Z]+)$/);

      const amount = parseFloat(match?.at(1) ?? '-1');
      const ingredient = match?.at(3) ?? 'unknown';
      return {
        amount,
        ingredient,
      };
    });
    const ingredientIcons = splitProducedIngredients.map(({ ingredient }) => {
      return readFileSync(path.join(__dirname, `../../assets/ingredient/${ingredient.toLowerCase()}.png`)).toString(
        'base64'
      );
    });
    const pokemonIcon = readFileSync(
      path.join(__dirname, `../../assets/pokemon/${pokemon.toLowerCase()}.png`)
    ).toString('base64');
    const grassBackground = readFileSync(path.join(__dirname, `../../assets/grass-background.png`)).toString('base64');

    // TODO: x plaement of all ingredient icons and text needs to depend on which amounts have decimals etc
    const svgImage = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <defs>
      <filter id="grayscale">
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0
                                             0.33 0.33 0.33 0 0
                                             0.33 0.33 0.33 0 0
                                             0    0    0    1 0"/>
        </filter>
    </defs>  
    <style>
        .title { fill: #000; font-size: 70px; font-family: Arial; }
        .desc { fill: #090909; font-size: 50px; font-family: Arial; }
      </style>
      <rect width="100%" height="95%" fill="#555"/>
      <rect y="95%" width="100%" height="5%" fill="#f04545"/>

      <image x="-200" y="100" height="250" width="1200" xlink:href="data:image/png;base64,${grassBackground}"/>
      <image x="600" y="100" height="250" width="1200" xlink:href="data:image/png;base64,${grassBackground}"/>
      <image x="800" y="-100" width="500" height="500" xlink:href="data:image/png;base64,${pokemonIcon}"/>
      <image x="700" y="10" width="75" height="75" xlink:href="data:image/png;base64,${ingredientIcons[0]}"/>
      <image x="770" y="10" width="75" height="75" xlink:href="data:image/png;base64,${ingredientIcons[1]}"/>
      <image x="840" y="10" width="75" height="75" xlink:href="data:image/png;base64,${ingredientIcons[0]}" filter="url(#grayscale)"/>

      <text x="120" y="200" class="desc">${splitProducedIngredients[0].amount}</text>
      <image x="180" y="140" width="75" height="75" xlink:href="data:image/png;base64,${ingredientIcons[0]}"/>
      <text x="250" y="200" class="desc">${splitProducedIngredients[1].amount}</text>
      <image x="310" y="140" width="75" height="75" xlink:href="data:image/png;base64,${ingredientIcons[1]}"/>
      
      <circle cx="1080" cy="500" r="30" fill="white" />
      <image x="1050" y="475" width="50" height="50" xlink:href="data:image/png;base64,${sneaselIcon}"/>
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

  #decodeShareParams() {
    return;
  }
}

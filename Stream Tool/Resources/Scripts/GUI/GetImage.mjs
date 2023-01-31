import { stPath } from './Globals.mjs';
import { getRoARecolor } from './RoA WebGL Shader.mjs';
import { fileExists } from './File System.mjs';

/**
 * @typedef {Object} Skin
 * @property {String} hex - The skin color code to be used
 * @property {Boolean} blend - Makes the image have "Early Access" shading
 * @property {Array} alpha - Set the transparency for each part (for example: [1, 0.75, 0.5, 1])
 * @property {Boolean} golden - Adds golden shading to the character's black pixels
 * @property {Boolean} force - Forces recoloring of the image with the given hex code
*/

/**
 * Returns a regular src path if an image with the skin name exists.
 * Returns a recolored image src if skin data for it exists.
 * Returns the default skin image if skin data or image file can't be found.
 * Returns the random image if a default skin image can't be found.
 * @param {String} char - Character name
 * @param {Skin} skin - Skin data
 * @param {Array} colorData - Character's original colors and ranges for shader data
 * @param {String} imgType - To determine which folder to look for
 * @param {String} failPath - To determine which image to use in case of fail
 * @returns {String} - Image src
*/
export async function getRecolorImage(char, skin, colorData, imgType, failPath) {

    if (!skin.force && await fileExists(`${stPath.char}/${char}/${imgType}/${skin.name}.png`)) {

        // if the image exists and we are not forcing a recolor, send an unmodified image
        return `${stPath.char}/${char}/${imgType}/${skin.name}.png`;

    } else if (await fileExists(`${stPath.char}/${char}/${imgType}/Default.png`)) {

        // if the skin wants to force a recolor, check if the file exists first
        let charImgPath;
        if (skin.force && await fileExists(`${stPath.char}/${char}/${imgType}/${skin.customImg || skin.name}.png`)) {
            charImgPath = `${stPath.char}/${char}/${imgType}/${skin.customImg || skin.name}.png`;
        } else {
            charImgPath = `${stPath.char}/${char}/${imgType}/Default.png`;
        }
        const trueColorData = colorData[skin.customImg] || colorData[skin.name] || colorData.Default;
        return await getRoARecolor(
            char,
            charImgPath,
            trueColorData.ogColor,
            trueColorData.colorRange,
            skin
        );

    } else {
        return `${stPath.charRandom}/${failPath}.png`;
    }

}

/**
 * Returns a monocolor image src preserving alpha of the requested character+skin.
 * If an image can't be found, it returns a 1x1 transparent pixer src.
 * @param {String} char Character name
 * @param {Skin} skin - Skin data
 * @param {String} color - Desired out color
 * @returns {String} - Image src
 */
export async function getTrailImage(char, skin, color) {

    // we add "FFFFFF" to the color to avoid shader issues when using only 1 color
    color += "FFFFFF";

    if (await fileExists(`${stPath.char}/${char}/Skins/${skin}.png`)) {

        // if the requested skin exists as a separate image
        return await getRoARecolor(
            "Trail",
            `${stPath.char}/${char}/Skins/${skin}.png`,
            [127, 127, 127, 1, 0,0,0,0], // any color would do
            [360, 100, 100, 1, 0,0,0,0], // range picks up all colors
            {hex : color, ea : true}, // with blend true, only 1 color will be applied to everything
        )

    } else if (await fileExists(`${stPath.char}/${char}/Skins/Default.png`)) {

        // else, use the default skin image
        return await getRoARecolor(
            "Trail",
            `${stPath.char}/${char}/Skins/Default.png`,
            [127, 127, 127, 1, 0,0,0,0],
            [360, 100, 100, 1, 0,0,0,0],
            {hex : color, ea : true},
        )

    } else {

        // if an image can't be found, return a 1x1 transparent pixel
        return 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

    }

}
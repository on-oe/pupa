/**
 * Returns a function that generates BEM class names.
 * @param block - The BEM block name.
 * @returns A function that generates BEM class names based on the block name.
 */
export function bem(block: string) {
        return function(element?: string, modifier?: string) {
            if (element && modifier) {
                return `${block}__${element}--${modifier}`;
            } else if (element) {
                return `${block}__${element}`;
            } else if (modifier) {
                return `${block}--${modifier}`;
            }
            return block;
        }
}
// Action type sent to change the tooltip being displayed
export const CHANGE_TOOLTIP = Symbol('TooltipChange');

export const Tooltips = {
    default: Symbol('TooltipDefault'),
    priceRange: Symbol('TooltipPriceRange'),
    search: Symbol('TooltipSearch'),
    product: Symbol('TooltipProduct'),
    addToCart: Symbol('TooltipAddtoCart'),
    removeFromCart: Symbol('TooltipRemoveFromCart')
};

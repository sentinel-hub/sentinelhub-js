import { AbstractDEMLayer, ConstructorParameters } from './AbstractDEMLayer';
export declare class DEMAWSUSLayer extends AbstractDEMLayer {
    readonly dataset: import("./dataset").Dataset;
    constructor({ demInstance, ...rest }: ConstructorParameters);
}

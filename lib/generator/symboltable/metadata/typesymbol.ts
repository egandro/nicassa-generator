export interface TypeSymbol {
    isPrimitive: boolean;
    isArray: boolean;
    isReferenceType: boolean;
    getMappedName(kind: string): string;
}

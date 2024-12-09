export interface Plan {
    credits?: string | number;
    deletedAt?: string;
    features?: any[];
    name?: string;
    hasSale?: boolean;
    discount?: string | number;
    oldPrice?: string | number;
    period?:  string;
    planId?: string;
    price?: string | number | undefined;
    periodText: string;
    featuresFormated: any[];
    priceId: string;
    priceIdForMonth: string;
    isActiveYearly: boolean;
    isActiveMonthly: boolean;
    currentOption: any;
    className: string;
}

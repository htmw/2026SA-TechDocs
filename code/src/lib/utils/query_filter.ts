import { Document } from "mongoose";

export type SortOrder = 1 | -1;

export interface QuerySearchConfig {
    query_fields?: string[];
    string_fields?: string[];
    category_field?: string;
    number_fields?: string[];
    date_fields?: string[];
    default_sort_field?: string;
}

export interface QuerySearchResult<T> {
    query: Record<string, any>;
    sort: Record<string, SortOrder>;
    limit: number;
    page: number;
    paginate: boolean;
}

const parsePositiveInt = (value: string | undefined, fallback: number, max: number): number => {
    if (value === undefined) return fallback;

    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
        throw new Error("Invalid paging value");
    }

    return Math.min(parsed, max);
};

export const parsePaginationParameters = (params: Record<string, string | undefined>): { limit: number; page: number } => {
    return {
        limit: parsePositiveInt(params.limit, 100, 500),
        page: parsePositiveInt(params.page, 1, Number.MAX_SAFE_INTEGER),
    };
};

export const parseSortParameters = (
    params: Record<string, string | undefined>,
    allowedFields: string[],
    defaultField?: string
): Record<string, SortOrder> => {
    const requested = params.sort_field || params.sort;
    const sortField = requested ? requested.trim() : (defaultField ? defaultField.trim() : "");

    if (!sortField) {
        return {};
    }

    if (!allowedFields.includes(sortField)) {
        throw new Error("Invalid sort field");
    }

    const sortDirRaw = (params.sort_dir || params.direction || params.sort_direction || "asc").toLowerCase();
    const direction: SortOrder = sortDirRaw === "desc" || sortDirRaw === "-1" ? -1 : 1;

    return { [sortField]: direction };
};

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const buildFilterConditions = (
    params: Record<string, string | undefined>,
    config: QuerySearchConfig
): Record<string, any> => {
    const filter: Record<string, any> = {};

    if (config.query_fields?.length) {
        const q = params.q?.trim();
        if (q) {
            filter.$or = config.query_fields.map((field) => ({ [field]: { $regex: q, $options: "i" } }));
        }
    }

    if (config.string_fields) {
        for (const field of config.string_fields) {
            const exact = params[`${field}_exact`]?.trim();
            const contains = params[`${field}_contains`]?.trim();
            const startsWith = params[`${field}_startsWith`]?.trim();
            const endsWith = params[`${field}_endsWith`]?.trim();

            if (exact) {
                filter[field] = exact;
            } else if (contains) {
                filter[field] = { $regex: escapeRegex(contains), $options: "i" };
            } else if (startsWith) {
                filter[field] = { $regex: `^${escapeRegex(startsWith)}`, $options: "i" };
            } else if (endsWith) {
                filter[field] = { $regex: `${escapeRegex(endsWith)}$`, $options: "i" };
            }
        }
    }

    if (config.category_field && params.category?.trim()) {
        filter[config.category_field] = { $in: [params.category.trim()] };
    }

    if (config.number_fields) {
        for (const field of config.number_fields) {
            const eq = params[`${field}_eq`];
            const gt = params[`${field}_gt`];
            const gte = params[`${field}_gte`];
            const lt = params[`${field}_lt`];
            const lte = params[`${field}_lte`];

            if (eq !== undefined) {
                const parsed = parseFloat(eq);
                if (Number.isNaN(parsed)) {
                    throw new Error(`Invalid ${field}_eq`);
                }
                filter[field] = parsed;
                continue;
            }

            const comparator: Record<string, number> = {};
            if (gt !== undefined) {
                const parsed = parseFloat(gt);
                if (Number.isNaN(parsed)) throw new Error(`Invalid ${field}_gt`);
                comparator.$gt = parsed;
            }
            if (gte !== undefined) {
                const parsed = parseFloat(gte);
                if (Number.isNaN(parsed)) throw new Error(`Invalid ${field}_gte`);
                comparator.$gte = parsed;
            }
            if (lt !== undefined) {
                const parsed = parseFloat(lt);
                if (Number.isNaN(parsed)) throw new Error(`Invalid ${field}_lt`);
                comparator.$lt = parsed;
            }
            if (lte !== undefined) {
                const parsed = parseFloat(lte);
                if (Number.isNaN(parsed)) throw new Error(`Invalid ${field}_lte`);
                comparator.$lte = parsed;
            }

            if (Object.keys(comparator).length > 0) {
                filter[field] = comparator;
            }
        }
    }

    if (config.date_fields) {
        for (const field of config.date_fields) {
            const on = params[`${field}_on`];
            const before = params[`${field}_before`];
            const after = params[`${field}_after`];

            const dateFilter: Record<string, any> = {};
            if (on !== undefined) {
                const d = new Date(on);
                if (Number.isNaN(d.getTime())) throw new Error(`Invalid ${field}_on`);
                const start = new Date(d);
                start.setUTCHours(0, 0, 0, 0);
                const end = new Date(d);
                end.setUTCHours(23, 59, 59, 999);
                dateFilter.$gte = start;
                dateFilter.$lte = end;
            }
            if (before !== undefined) {
                const d = new Date(before);
                if (Number.isNaN(d.getTime())) throw new Error(`Invalid ${field}_before`);
                dateFilter.$lt = d;
            }
            if (after !== undefined) {
                const d = new Date(after);
                if (Number.isNaN(d.getTime())) throw new Error(`Invalid ${field}_after`);
                dateFilter.$gt = d;
            }

            if (Object.keys(dateFilter).length > 0) {
                filter[field] = dateFilter;
            }
        }
    }

    return filter;
};

export const buildSearch = <T extends Document>(
    params: Record<string, string | undefined>,
    config: QuerySearchConfig,
    sortFields: string[]
): QuerySearchResult<T> => {
    const { limit, page } = parsePaginationParameters(params);
    const sort = parseSortParameters(params, sortFields, config.default_sort_field);
    const query = buildFilterConditions(params, config);

    return { query, sort, limit, page, paginate: true };
};
